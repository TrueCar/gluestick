/* @flow */
import type { Context } from '../../types.js';

const webpackProgressHandler = require('../../config/webpack/progressHandler');
const { clearBuildDirectory } = require('../utils');
const getEntiresSnapshots = require('./getEntiresSnapshots');
const compile = require('./compile');

const printAndExit = (error: Error) => {
  console.error(error);
  process.exit(1);
};

module.exports = ({ logger, config }: Context, ...commandArgs: any[]): void => {
  const options: Object = commandArgs[commandArgs.length - 1];
  // If neither server not client flag is passed
  // set them both to true to compile both client and server.
  if (!options.client && !options.server) {
    options.client = true;
    options.server = true;
  }

  if (options.static && !options.server) {
    logger.warn('--static options should be used with server build');
  }

  if (options.client) {
    clearBuildDirectory(config.GSConfig, 'client');
    compile({ logger, config }, options, 'client').catch(printAndExit);
  }

  // If only server flag is passed, unmute server compilation - by default it's muted.
  if (options.server && !options.client) {
    webpackProgressHandler.toggleMute('server');
  }

  if (options.server) {
    clearBuildDirectory(config.GSConfig, 'server');
    compile({ logger, config }, options, 'server')
      .then(() => {
        return options.static ? getEntiresSnapshots({ config, logger }) : Promise.resolve();
      })
      .catch(printAndExit);
  }
};
