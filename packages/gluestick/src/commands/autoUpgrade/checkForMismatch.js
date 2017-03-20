/* @flow */
import type { MismatchedModules, UpdateDepsPromptResults } from '../../types';

const path = require('path');
const getSingleEntryFromGenerator = require('./getSingleEntryFromGenerator');
const parseConfig = require('gluestick-generators').parseConfig;
const utils = require('./utils');
const version = require('../../../package.json').version;

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
const checkForMismatch = (
  requiredPackage: ProjectPackage,
  dev: boolean,
): Promise<UpdateDepsPromptResults> => {
  // This is done to keep live reference to mock single function in testing
  const { isValidVersion, promptModulesUpdate } = utils;
  const projectPackage: ProjectPackage = {
    dependencies: {},
    devDependencies: {},
    ...requiredPackage,
  };
  const pathToPackageGenerator: string = path.join(
    require.resolve('gluestick-generators').split('gluestick-generators')[0],
    'gluestick-generators',
    'templates/package',
  );
  const packageGeneratorEntry: Object = getSingleEntryFromGenerator(
    pathToPackageGenerator, 'package.json', { gluestickDependencies: { gluestick: version } },
  );
  const templatePackage: ProjectPackage = JSON.parse(
    // $FlowIgnore template at this point will be a string
    parseConfig({
      entry: packageGeneratorEntry,
    }, {}).entry.template,
  );
  const mismatchedModules: MismatchedModules = {};
  const markMissing = (dep, type) => {
    mismatchedModules[dep] = {
      required: templatePackage[type][dep],
      project: projectPackage[type][dep] || 'missing',
      type,
    };
  };
  Object.keys(templatePackage.dependencies).forEach((dep: string): void => {
    if (dev && dep === 'gluestick' && !/\d+\.\d+\.\d+.*/.test(projectPackage.dependencies[dep])) {
      return;
    }
    if (
      !projectPackage.dependencies[dep] ||
      !isValidVersion(projectPackage.dependencies[dep], templatePackage.dependencies[dep])
    ) {
      markMissing(dep, 'dependencies');
    }
  });
  Object.keys(templatePackage.devDependencies).forEach((dep: string): void => {
    if (
      !projectPackage.devDependencies[dep] ||
      !isValidVersion(projectPackage.devDependencies[dep], templatePackage.devDependencies[dep])
    ) {
      markMissing(dep, 'devDependencies');
    }
  });

  // prompt for updates if we have any, otherwise we are done
  if (Object.keys(mismatchedModules).length > 0) {
    return promptModulesUpdate(mismatchedModules);
  }
  return Promise.resolve({ shouldFix: false, mismatchedModules: {} });
};

module.exports = checkForMismatch;
