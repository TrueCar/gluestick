/* @flow */

import type { Context } from '../types';

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
  logger.info(`    cd ${entityName}`);
  logger.info('    gluestick start');
  logger.info('    Point the browser to http://localhost:8888');
};

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

module.exports = (context: Context, appName: string) => {
  const { logger } = context;
  if (currentlyInProjectFolder(process.cwd())) {
    logger.info(`${filename(process.cwd())} is being generated...`);
    generateTemplate('new', appName, logger);
  }
};
