/* @flow */
import type { MismatchedModules, UpdateDepsPromptResults } from '../../types';

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const getSingleEntryFromGenerator = require('./getSingleEntryFromGenerator');
const parseConfig = require('gluestick-generators').parseConfig;
const utils = require('./utils');
const { version, preset = 'default' } = require('../../../package.json');

type ProjectPackage = {
  dependencies: Object,
  devDependencies: Object,
}

/**
 * Open the package.json file in both the project as well as the one used by
 * this command line interface, then compare the versions for shared modules.
 * If the CLI uses a different version than the project we are working in then
 * it will prompt the user to automatically update their project so that it
 * matches the module versions used by the CLI.
 *
 * Now when we update versions in the CLI that the package uses, the projects
 * will automatically get updated too.
 *
 * Also, We include all of the required dependencies when you generate a new
 * project.  Sometimes these dependencies change over time and we need a nice
 * way of updating apps that were generated with previous versions of the CLI.
 * To solve this problem, we look at both the dependencies and development
 * dependencies that would be included in a brand new application. If the
 * project is missing a required dependency, then we prompt the user to update
 * that as well.
 *
 * A Promise is returned so that we can use async/await when calling this
 * method.
 *
 * @return {Promise}
 */
module.exports = async (projectPackage: ProjectPackage): Promise<UpdateDepsPromptResults> => {
  // This is done to keep live reference to mock single function in testing
  const { isValidVersion, promptModulesUpdate } = utils;
  const normalizedProjectPackageJson: ProjectPackage = {
    dependencies: {},
    devDependencies: {},
    ...projectPackage,
  };


  const requiredProjectPackageJson: ProjectPackage = {
    dependencies: {},
    devDependencies: {},
  };

  // Check if preset package.json's version is the same as gluestick's version, if so, use
  // this preset for dependecies list, otherwise make a request to npm, to get the list.
  let presetPackageJson: Object;
  try {
    // require'ing gluestick-preset-${preset}/package.json will fail,
    // if the preset was just installed
    presetPackageJson = JSON.parse(
      fs.readFileSync(
        path.join(process.cwd(), `node_modules/gluestick-preset-${preset}/package.json`),
        'utf-8',
      ),
    );
  } catch (e) {
    presetPackageJson = {};
  }
  if (presetPackageJson.version === version) {
    requiredProjectPackageJson.dependencies = presetPackageJson
      .gsProjectDependencies
      .dependencies;
    requiredProjectPackageJson.devDependencies = presetPackageJson
      .gsProjectDependencies
      .devDependencies;
  } else {
    const api = 'http://registry.npmjs.org';
    try {
      const payload = await fetch(`${api}/gluestick-preset-${preset}`)
        .then(response => response.json());
      const { gsProjectDependencies } = payload.versions[version];
      requiredProjectPackageJson.dependencies = gsProjectDependencies.dependencies;
      requiredProjectPackageJson.devDependencies = gsProjectDependencies.devDependencies;
    } catch (error) {
      throw new Error(`Error requesting dependency list from npm registry: ${error.message}`);
    }
  }

  const pathToPackageJsonGenerator: string = require.resolve(
    'gluestick-generators/build/generators/packageJson',
  );
  const packageJsonGeneratorEntry: Object = getSingleEntryFromGenerator(
    pathToPackageJsonGenerator,
    'package.json',
    {
      gluestickDependencies: { gluestick: version },
      presetDependencies: requiredProjectPackageJson,
    },
  );
  const packageJsonTemplate: ProjectPackage = JSON.parse(
    // $FlowIgnore template at this point will be a string
    parseConfig({
      entry: packageJsonGeneratorEntry,
    }, {}).entry.template,
  );
  const mismatchedModules: MismatchedModules = {};
  const markMissing = (dep, type) => {
    mismatchedModules[dep] = {
      required: packageJsonTemplate[type][dep],
      project: normalizedProjectPackageJson[type][dep] || 'missing',
      type,
    };
  };

  Object.keys(packageJsonTemplate.dependencies).forEach((dep: string): void => {
    if (dep === 'gluestick' && !/\d+\.\d+\.\d+.*/.test(normalizedProjectPackageJson.dependencies[dep])) {
      return;
    }
    if (
      !normalizedProjectPackageJson.dependencies[dep] ||
      !isValidVersion(
        normalizedProjectPackageJson.dependencies[dep], packageJsonTemplate.dependencies[dep],
      )
    ) {
      markMissing(dep, 'dependencies');
    }
  });
  Object.keys(packageJsonTemplate.devDependencies).forEach((dep: string): void => {
    if (
      !normalizedProjectPackageJson.devDependencies[dep] ||
      !isValidVersion(
        normalizedProjectPackageJson.devDependencies[dep], packageJsonTemplate.devDependencies[dep],
      )
    ) {
      markMissing(dep, 'devDependencies');
    }
  });

  // Prompt for updates if we have any, otherwise we are done
  if (Object.keys(mismatchedModules).length > 0) {
    return promptModulesUpdate(mismatchedModules);
  }
  return Promise.resolve({ shouldFix: false, mismatchedModules: {} });
};
