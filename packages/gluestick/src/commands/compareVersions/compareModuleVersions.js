/* @flow */
import type { Logger } from '../../types.js';

const semver = require('semver');
const path = require('path');
const chalk = require('chalk');
const { createArrowList } = require('../../cli/helpers');
const { highlight } = require('../../cli/colorScheme');

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

type Discrepancy = {
  name: string,
  required: string,
  found: ?string,
};

const checkVersions = (dependencies: Object, modulePath: string, discrepancies: Discrepancy[],
  requireCall: Function) => {
  Object.keys(dependencies).forEach((depName: string) => {
    const depVersion: string = dependencies[depName];
    const tempPath: string = path.join(modulePath, depName, packageName);
    let tempPackage: Object;
    let tempDiscrepancy: Discrepancy;

    try {
      tempPackage = requireCall(tempPath);
    } catch (e) {
      tempDiscrepancy = {
        name: depName,
        required: depVersion,
        found: 'N/A - missing',
      };
      discrepancies.push(tempDiscrepancy);
      return;
    }

    if (depVersion && !semver.satisfies(tempPackage.version, depVersion)) {
      const versionMatch = depVersion.match(/\d+\.\d+\.\d+.*/);

      if ((versionMatch && depVersion.includes('file:') && !tempPackage._from.includes(versionMatch)) ||
          (versionMatch && (!depVersion.includes('file:') && !path.isAbsolute(depVersion) && !/^\.\.?\//.test(depVersion)))) {
        tempDiscrepancy = {
          name: depName,
          required: versionMatch ? versionMatch[0] : depVersion,
          found: tempPackage.version,
        };
        discrepancies.push(tempDiscrepancy);
      }
    }
  });
  return discrepancies;
};

module.exports = (projectPackage: Object, modulePath: string, logger: Logger,
  requireCall: Function) => {
  const discrepancies: Discrepancy[] = [];

  if (projectPackage.dependencies) {
    checkVersions(projectPackage.dependencies, modulePath, discrepancies, requireCall);
  }
  if (projectPackage.devDependencies) {
    checkVersions(projectPackage.devDependencies, modulePath, discrepancies, requireCall);
  }

  if (discrepancies.length === 0) {
    logger.success('No problems found: all dependencies are valid.');
  } else {
    logger.error(
      `Found problems with the following dependencies:\n${
        createArrowList(
          discrepancies.map(({ name, required, found }) => `${
            highlight(name)
          }: required version ${
            highlight(required)
          }, found ${
            highlight(found)
          }`),
          10,
        )
      }`,
    );
    logger.error('Run', `${chalk.yellow('npm install')}`, 'to resolve this issue.');
  }
  return discrepancies;
};
