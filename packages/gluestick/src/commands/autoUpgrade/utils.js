/* @flow */
import type {
  Logger,
  Question,
  MismatchedModules,
  UpdateDepsPromptResults,
} from '../../types';

const path = require('path');
const fs = require('fs');
const semver = require('semver');
const chalk = require('chalk');
const inquirer = require('inquirer');

/**
 * Let the user know that we are updating the file and copy the contents over.
 *
 * @param {String} name the name of the file
 * @param {String} data the data for the new file
 */
const replaceFile = (logger: Logger, name: string, data: string): void => {
  const filePath: string = path.join(process.cwd(), name);

  logger.info(`${name} file is out of date.`);
  logger.info(`Updating ${filePath}`);
  fs.writeFileSync(filePath, data);
};

/**
 * Determine a version meets or exceeds a requirement.
 *
 * @param {String} version the version to test
 * @param {String} requiredVersion the version to test against
 *
 * @return {Boolean}
 */
const isValidVersion = (version: string, requiredVersion: string): boolean => {
  if (!version) {
    return false;
  }

  // Trim off carrot or other things on the version like `^3.0.1` or `>3.0.1`
  const trimmedVersion: string = version.replace(/^\D*/, '');
  if (!semver.valid(trimmedVersion)) {
    return false;
  }

  const result: boolean =
    semver.satisfies(trimmedVersion, requiredVersion) ||
    semver.gte(trimmedVersion, requiredVersion);

  return result;
};

/**
 * Given an object of mismatched modules, prompt the user if they would like to
 * update the modules or not.
 *
 * @param {MismatchedModule} mismatchedModules see `fixVersionMismatch` function at the
 * top to see what the object looks like
 * @returns {Promise<boolean>}
 */
const promptModulesUpdate = (
  mismatchedModules: MismatchedModules,
): Promise<UpdateDepsPromptResults> => {
  const mismatchedModuleOutput: string = JSON.stringify(
    mismatchedModules,
    null,
    ' ',
  );

  const question: Question = {
    type: 'confirm',
    name: 'confirm',
    message:
      `${chalk.red(
        'The `gluestick` project template and your project have mismatching',
      )} ` +
      `${chalk.red('versions of the following modules: ')}` +
      `${chalk.yellow(mismatchedModuleOutput)}\n` +
      "Would you like to automatically update your project's dependencies to match the template?",
  };
  return inquirer.prompt([question]).then(answers =>
    Promise.resolve({
      shouldFix: !!answers.confirm,
      mismatchedModules,
    }),
  );
};

module.exports = {
  isValidVersion,
  replaceFile,
  promptModulesUpdate,
};
