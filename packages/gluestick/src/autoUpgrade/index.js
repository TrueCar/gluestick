/* @flow */
import type { Context, UpdateDepsPromptResults, ProjectPackage } from '../types';

const fs = require('fs');
const path = require('path');
const sha1 = require('sha1');

const checkForMismatch = require('./checkForMismatch');
const updateDependencies = require('./updateDependencies');
const getSingleEntryFromGenerator = require('./getSingleEntryFromGenerator');
const parseConfig = require('../generator/parseConfig');

module.exports = ({ logger }: Context) => {
  const projectPackage: ProjectPackage = require(path.join(process.cwd(), 'package.json'));

  // Compare contents of our hidden files, if they do not match up then auto update them
  [
    'src/config/.Dockerfile',   // -> last updated in 0.2.0
  ].forEach((filePath: string): void => {
    const currentHash: string = sha1(fs.readFileSync(path.join(process.cwd(), filePath)));
    const generatorEntry: Object = getSingleEntryFromGenerator('new', path.basename(filePath), {});
    const entryConfig = parseConfig({
      entry: generatorEntry,
    }, {});
    const templateHash: string = sha1(entryConfig.entry.template);
    if (currentHash !== templateHash) {
      const absolutePath: string = path.join(process.cwd(), filePath);
      logger.success(`${filePath} file is out of date. Updating at path ${absolutePath}...`);
      fs.writeFileSync(absolutePath, entryConfig.entry.template, 'utf-8');
    }
  });

  // Check for certain files that we've added to new Gluestick applications.
  // If those files don't exist, add them for the user.
  [
    'src/config/application.js',        // -> prior to 0.1.6
    'src/config/webpack-additions.js',  // -> prior to 0.1.12
    'src/config/redux-middleware.js',   // -> prior to 0.1.12
    'src/config/.Dockerfile',           // -> prior to 0.2.0
    '.dockerignore',                    // -> prior to 0.3.6
    'src/config/init.browser.js',        // -> prior to 0.9.26
    // TODO: add files from V2
  ].forEach((filePath: string): void => {
    if (!fs.existsSync(path.join(process.cwd(), filePath))) {
      const absolutePath: string = path.join(process.cwd(), filePath);
      logger.success(`File ${filePath} does not exist. Creating at path ${absolutePath}...`);
      const generatorEntry: Object = getSingleEntryFromGenerator('new', path.basename(filePath), {});
      const entryConfig = parseConfig({
        entry: generatorEntry,
      }, {});
      fs.writeFileSync(absolutePath, entryConfig.entry.template, 'utf-8');
    }
  });

  // Update dependencies
  return checkForMismatch(projectPackage).then((results: UpdateDepsPromptResults): void => {
    if (results.shouldFix) {
      updateDependencies(logger, projectPackage, results.mismatchedModules);
    }
  });
};
