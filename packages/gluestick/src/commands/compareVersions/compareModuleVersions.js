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

const versionRegex = /\d+\.\d+\.\d+(-[a-z]+\.\d+)?/;

const checkVersions = (
  dependencies: Object,
  modulePath: string,
  discrepancies: Discrepancy[],
  requireCall: Function,
) => {
  Object.keys(dependencies).forEach((depName: string) => {
    const requiredVersion: string = dependencies[depName];
    const packageJsonPath: string = path.join(modulePath, depName, packageName);
    let installedPackage: Object;

    try {
      installedPackage = requireCall(packageJsonPath);
    } catch (e) {
      discrepancies.push({
        name: depName,
        required: requiredVersion,
        found: 'N/A - missing',
      });
      return;
    }

    if (
      requiredVersion &&
      !semver.satisfies(installedPackage.version, requiredVersion)
    ) {
      const requiredVersionMatch = requiredVersion.match(versionRegex);
      const installedVersionMatch = installedPackage.version.match(
        versionRegex,
      );
      if (
        requiredVersionMatch &&
        installedVersionMatch &&
        !semver.satisfies(installedVersionMatch[0], requiredVersionMatch[0])
      ) {
        discrepancies.push({
          name: depName,
          required: requiredVersionMatch[0],
          found: installedVersionMatch[0],
        });
      }
    }
  });
};

module.exports = (
  projectPackage: Object,
  modulePath: string,
  logger: Logger,
  requireCall?: Function = require,
) => {
  const discrepancies: Discrepancy[] = [];

  if (projectPackage.dependencies) {
    checkVersions(
      projectPackage.dependencies,
      modulePath,
      discrepancies,
      requireCall,
    );
  }
  if (projectPackage.devDependencies) {
    checkVersions(
      projectPackage.devDependencies,
      modulePath,
      discrepancies,
      requireCall,
    );
  }

  if (discrepancies.length === 0) {
    logger.success('No problems found: all dependencies are valid.');
  } else {
    logger.error(
      `Found problems with the following dependencies:\n${createArrowList(
        discrepancies.map(
          ({ name, required, found }) =>
            `${highlight(name)}: required version ${highlight(
              required,
            )}, found ${highlight(found)}`,
        ),
        10,
      )}`,
    );
    logger.error(`Run ${chalk.yellow('npm install')} to resolve this issue`);
  }
  return discrepancies;
};
