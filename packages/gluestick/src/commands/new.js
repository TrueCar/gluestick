/* @flow */

import type { Logger } from '../types';

const inquirer = require('inquirer');
const { highlight, filename } = require('../cli/colorScheme');
const generate = require('../generator');
const path = require('path');

const generateTemplate = (generatorName, entityName, logger) => {
  generate({
    generatorName,
    entityName,
  }, logger);
  logger.info(`${highlight('New GlueStick project created')} at ${filename(process.cwd())}`);
  logger.info('To run your app and start developing');
  logger.info(`cd ${entityName}`);
  logger.info('gluestick start');
  logger.info('Point the browser to http://localhost:8888');
};

module.exports = (logger: Logger) => {
  const currentlyInProjectFolder = (folderPath) => {
    const fileName: string = path.join(folderPath, 'package.json');
    let data: ?Object = null;
    try {
      data = require(fileName);
      return !!data.dependencies && !!data.dependencies.gluestick;
    } catch (e) {
      return false;
    }
  };

  console.log(`${filename(process.cwd())}`);
    // Run from inside an existing project, install in current directory if approved
  if (currentlyInProjectFolder(process.cwd())) {
    logger.info(
      `You are about to initialize a new gluestick project at ${filename(process.cwd())}`,
    );
    const question = {
      type: 'confirm',
      name: 'confirm',
      message: 'Do you wish to continue?',
    };
    inquirer.prompt([question]).then((answers) => {
      if (!answers.confirm) { return; }
      generateTemplate('new', 'new', logger);
    });
    return;
  }

  generateTemplate('new', 'new', logger);
};
