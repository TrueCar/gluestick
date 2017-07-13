/* @flow */
import type { CLIContext, WebpackConfigEntry } from '../../types';

const webpack = require('webpack');
const { spawn } = require('cross-spawn');
const logMessage = require('./logMessage');

/**
 * Spawns new process with rendering server.
 *
 * @param {any} { config, logger } Context
 * @param {string} entryPointPath Path to renderer server entry file
 * @param {Array<string>} args Arguments to pass to entry
 */
const spawnServer = (
  { config, logger }: CLIContext,
  entryPointPath: string,
  args: string[],
): Object => {
  const child: Object = spawn('node', [entryPointPath].concat(args), {
    stdio: ['ipc', 'inherit', 'inherit'],
  });
  logMessage(logger, child);
  return child;
};

/**
 * Builds rendering server bundle and runs it.
 *
 * @param {any} { config, logger } Context
 * @param {string} entryPointPath Path to renderer server entry file
 * @param {Array<string>} args Arguments to pass to entry
 */
module.exports = (
  { config, logger }: CLIContext,
  entryPointPath: string,
  args: string[],
  delayStart: Promise<void>,
) => {
  const webpackConfig: WebpackConfigEntry = config.webpackConfig.server;
  let child: ?Object = null;
  logger.info('Compiling renderer bundle');
  webpack(webpackConfig).watch({}, error => {
    if (error) {
      logger.error(error);
      return;
    }

    delayStart.then(() => {
      if (child) {
        child.kill();
      }

      child = spawnServer({ config, logger }, entryPointPath, args);
    });
  });
};
