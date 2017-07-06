/* @flow */
import type { Logger } from '../../types.js';

const semver = require('semver');
const chalk = require('chalk');
const path = require('path');

const packageName = '/package.json';

/**
 * Opens the project's package.json file and compares version requirements to
 * the actual version of each dependency and devDependency. It lists the
 * node_modules that don't satisfy the requirement or are missing and suggests
 * running `npm install` to amend the issue.
 *
 * Corner cases: there are no dependencies and/or devDependencies, the version
 * is a path to a file, the input file to the package.json or node_modules dir
 * is either undefined or incorrect.
 *
 * Return - returns array of dependencies that are missing or out of date.
 */
const compareModuleVersions = (projectPackage: Object, modulePath: string, logger: Logger) => {
  const discrepancies = [];
  let devDepDifference = false;
  let allDependencies;

  if (!projectPackage.dependencies || !projectPackage.devDependencies) {
    if (!projectPackage.dependencies && !projectPackage.devDependencies) {
      return discrepancies;
    }
    allDependencies = projectPackage.dependencies || projectPackage.devDependencies;
  } else {
    const totalNumDependencies = Object.keys(projectPackage.dependencies).length +
      Object.keys(projectPackage.devDependencies).length;
    allDependencies = { ...projectPackage.dependencies, ...projectPackage.devDependencies };
    if (Object.keys(allDependencies).length < totalNumDependencies) {
      devDepDifference = true;
    }
  }

  Object.keys(allDependencies).forEach(dep => {
    const tempPath = path.join(modulePath, dep, packageName);
    let tempPackage;
    try {
      tempPackage = require(tempPath);
    } catch (e) {
      logger.error('The node_module ', `${chalk.yellow(dep)}`, ' does not exist.');
      const name = ' '.concat(dep);
      discrepancies.push(name);
      return;
    }

    if (allDependencies[dep] && !semver.satisfies(tempPackage.version, allDependencies[dep])) {
      const fileVersionMatch = allDependencies[dep].match(/\d+\.\d+\.\d+/);
      if (tempPackage._from.search(fileVersionMatch) === -1) {
        logger.error('The node_module ', `${chalk.yellow(dep)}`, ' does not satisfy the required version in your package.json.');
        const name = ' '.concat(dep.toString());
        discrepancies.push(name);
      }
    }
  });

  if (discrepancies.length === 0) {
    logger.success('\nNo problems! All node_module versions currently satisfy your package.json.\n');
  } else {
    logger.error((devDepDifference) ? 'One or more of these node_modules may have a discrepancy between their dependency and devDependency in package.json.\n' : '',
    '\nThe node_module(s)', `${chalk.yellow(discrepancies)}`, ' is(are) either missing or out of date.\n',
    '\nRun', `${chalk.yellow('npm install')}`, 'to resolve this discrepancy.\n');
  }
  return discrepancies;
};

module.exports = compareModuleVersions;
