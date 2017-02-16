/* @flow */
import type { Context, Logger, GeneratorOptions } from '../types';

const path = require('path');
const spawn = require('cross-spawn');

const { highlight, filename } = require('../cli/colorScheme');
const generate = require('../generator');

type ProjectData = {
  dependencies: {
    gluestick: string,
  }
}

const generateTemplate = (
  generatorName: string,
  entityName: string,
  logger: Logger,
  options: GeneratorOptions,
) => {
  generate({
    generatorName,
    entityName,
    options,
  }, logger);
};

const currentlyInProjectFolder = (folderPath: string) => {
  const fileName: string = path.join(folderPath, 'package.json');
  let data: ?ProjectData = null;
  try {
    data = require(fileName);
    return !!data.dependencies && !!data.dependencies.gluestick;
  } catch (e) {
    return false;
  }
};

module.exports = ({ logger }: Context, appName: string, options: Object = {}) => {
  if (currentlyInProjectFolder(process.cwd())) {
    logger.info(`${filename(appName)} is being generated...`);

    generateTemplate('new', appName, logger, { dev: options.dev || null, appName });
    // @TODO we need to figure out a better way
    spawn.sync('npm', ['install'], { stdio: 'inherit' });

    logger.info(`${highlight('New GlueStick project created')} at ${filename(process.cwd())}`);
    logger.info('To run your app and start developing');
    logger.info(`    cd ${appName}`);
    logger.info('    gluestick start');
    logger.info('    Point the browser to http://localhost:8888');

    process.exit(0);
  }
};
