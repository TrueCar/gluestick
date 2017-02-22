/* @flow */
import type { Context, UpdateDepsPromptResults, ProjectPackage } from '../types';

const fs = require('fs');
const path = require('path');
const sha1 = require('sha1');
const mkdirp = require('mkdirp');

const checkForMismatch = require('./checkForMismatch');
const updateDependencies = require('./updateDependencies');
const getSingleEntryFromGenerator = require('./getSingleEntryFromGenerator');
const parseConfig = require('../generator/parseConfig');

module.exports = ({ config, logger }: Context) => {
  const projectPackage: ProjectPackage = require(path.join(process.cwd(), 'package.json'));
  config.GSConfig.autoUpgrade.changed.forEach((filePath: string): void => {
    const currentHash: string = sha1(fs.readFileSync(path.join(process.cwd(), filePath)));
    const generatorEntry: Object = getSingleEntryFromGenerator('new', path.basename(filePath), {});
    const entryConfig = parseConfig({
      entry: generatorEntry,
    }, {});
    // $FlowIgnore
    const templateHash: string = sha1(entryConfig.entry.template);
    if (currentHash !== templateHash) {
      const absolutePath: string = path.join(process.cwd(), filePath);
      logger.success(`${filePath} file is out of date. Updating at path ${absolutePath}...`);
      mkdirp.sync(path.dirname(filePath));
      // $FlowIgnore template will be a string
      fs.writeFileSync(absolutePath, entryConfig.entry.template, 'utf-8');
    }
  });

  config.GSConfig.autoUpgrade.added.forEach((filePath: string): void => {
    if (!fs.existsSync(path.join(process.cwd(), filePath))) {
      const absolutePath: string = path.join(process.cwd(), filePath);
      logger.success(`File ${filePath} does not exist. Creating at path ${absolutePath}...`);
      const generatorEntry: Object = getSingleEntryFromGenerator('new', path.basename(filePath), {});
      const entryConfig = parseConfig({
        entry: generatorEntry,
      }, {});
      mkdirp.sync(path.dirname(filePath));
      // $FlowIgnore template will be a string
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
