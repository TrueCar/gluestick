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

  if (options.static && (!options.client || !options.server)) {
    throw new Error('--static options must be used with both client and server build');
  }

  let clientCompilation = Promise.resolve();
  if (options.client) {
    clearBuildDirectory(config.GSConfig, 'client');
    clientCompilation = compile({ logger, config }, options, 'client').catch(printAndExit);
  }

  // If only server flag is passed, unmute server compilation - by default it's muted.
  if (options.server && !options.client) {
    webpackProgressHandler.toggleMute('server');
  }

  if (options.server) {
    clearBuildDirectory(config.GSConfig, 'server');
    Promise.all([
      compile({ logger, config }, options, 'server').catch(printAndExit),
      clientCompilation,
    ]).then(() => {
      return options.static ? getEntiresSnapshots({ config, logger }) : Promise.resolve();
    });
  }
};
