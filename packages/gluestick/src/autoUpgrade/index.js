/* @flow */
import type { Context, UpdateDepsPromptResults, ProjectPackage } from '../types';

// const fs = require('fs');
const path = require('path');
// const sha1 = require('sha1');

const checkForMismatch = require('./checkForMismatch');
const updateDependencies = require('./updateDependencies');
// const generateFile = require('./generateFile');
// const getSingleEntryFromGenerator = require('./getSingleEntryFromGenerator');
// const parseConfig = require('../generator/parseConfig');
// const replaceFile = require('./replaceFile');

module.exports = ({ config, logger }: Context) => {
  const projectPackage: ProjectPackage = require(path.join(process.cwd(), 'package.json'));
  return checkForMismatch(projectPackage).then((results: UpdateDepsPromptResults): void => {
    if (results.shouldFix) {
      updateDependencies(logger, projectPackage, results.mismatchedModules);
    }
  });

  // Check for certain files that we've added to new Gluestick applications.
  // If those files don't exist, add them for the user.
  // const newFiles: string[] = [
  //   'src/config/application.js',        // -> prior to 0.1.6
  //   'src/config/webpack-additions.js',  // -> prior to 0.1.12
  //   'src/config/redux-middleware.js',   // -> prior to 0.1.12
  //   'src/config/.Dockerfile',           // -> prior to 0.2.0
  //   '.dockerignore',                    // -> prior to 0.3.6
  //   'src/config/init.browser.js',        // -> prior to 0.9.26
  //   // TODO: add files from V2
  // ];

  // newFiles.forEach((filePath: string): void => {
  //   if (!fs.existsSync(path.join(process.cwd(), filePath))) {
  //     generateFile(path.basename(filePath));
  //   }
  // });

  // Compare contents of our hidden files, if they do not match up then auto
  // update
  // [
  //   '.Dockerfile',   // -> last updated in 0.2.0
  // ].forEach((filePath: string): void => {
  //   const currentHash: string = sha1(fs.readFileSync(path.join(process.cwd(), filePath)));
  //   const generatorEntry: Object = getSingleEntryFromGenerator('new', path.basename(filePath));
  //   const entryConfig = parseConfig({
  //     entry: generatorEntry,
  //   }, {});
  //   const templateHash: string = sha1(entryConfig.entry.template);
  //   if (currentHash !== templateHash) {
  //     replaceFile(logger, filePath, entryConfig.entry.template);
  //   }
  // });
};
