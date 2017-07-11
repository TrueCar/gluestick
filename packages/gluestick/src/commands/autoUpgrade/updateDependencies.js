/* @flow */
import type { Logger, MismatchedModules, ProjectPackage } from '../../types';

const fs = require('fs');
const path = require('path');
const sO = require('sorted-object');

const {
  install: installDeps,
  cleanSync: cleanDeps,
} = require('../../lib/npmDependencies');

/**
 * Given an object of mismatched modules, load up the project's package.json
 * file, update it so the versions match, then install dependencies.
 *
 * @param {Object} mismatchedModules see `fixVersionMismatch` function at the
 * top to see what the object looks like
 */
const updateDependencies = (
  logger: Logger,
  projectPackage: ProjectPackage,
  mismatchedModules: MismatchedModules,
) => {
  const updatedPackage: ProjectPackage = projectPackage;
  if (!updatedPackage.dependencies) {
    updatedPackage.dependencies = {};
  }
  if (!updatedPackage.devDependencies) {
    updatedPackage.devDependencies = {};
  }

  Object.keys(mismatchedModules).forEach((dep: string): void => {
    const depPackage = mismatchedModules[dep];
    updatedPackage[depPackage.type][dep] = depPackage.required;
  });

  updatedPackage.dependencies = sO(updatedPackage.dependencies);
  updatedPackage.devDependencies = sO(updatedPackage.devDependencies);

  fs.writeFileSync(
    path.join(process.cwd(), 'package.json'),
    JSON.stringify(updatedPackage, null, '  '),
    'utf8',
  );

  cleanDeps();
  installDeps();

  logger.success('Dependecies have been updated and installed.');
};

module.exports = updateDependencies;
