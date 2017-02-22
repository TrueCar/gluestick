/* @flow */
import type { Context, WebpackConfigEntry } from '../../types';

const webpack = require('webpack');
const { spawn } = require('cross-spawn');
const chokidar = require('chokidar');
const path = require('path');
const { filename } = require('../../cli/colorScheme');

/**
 * Spawns new process with rendering server.
 *
 * @param {any} { config, logger } Context
 * @param {string} entryPointPath Path to renderer server entry file
 * @param {Array<string>} args Arguments to pass to entry
 */
const spawnServer = (
  { config, logger }: Context,
  entryPointPath: string,
  args: string[],
): Object => {
  const child: Object = spawn(
    'node',
    [entryPointPath].concat(args),
    { stdio: ['ipc', 'inherit', 'inherit'] },
  );
  child.on('message', (msg: { type: string, value: any[] }): void => {
    switch (msg.type) {
      default:
      case 'info':
        logger.info(...msg.value);
        break;
      case 'warn':
        logger.warn(...msg.value);
        break;
      case 'error':
        logger.error(...msg.value);
        break;
      case 'success':
        logger.success(...msg.value);
        break;
    }
  });
  return child;
};

/**
 * Builds rendering server bundle and runs it.
 *
 * @param {any} { config, logger } Context
 * @param {string} entryPointPath Path to renderer server entry file
 * @param {Array<string>} args Arguments to pass to entry
 */
module.exports = ({ config, logger }: Context, entryPointPath: string, args: string[]) => {
  const webpackConfig: WebpackConfigEntry = config.webpackConfig.server;
  let child: ?Object = null;
  const compile = (): void => {
    webpack(webpackConfig).run(error => {
      if (error) {
        throw error;
      }
      logger.info('Building server entry.');
      if (child) {
        child.kill();
      }
      child = spawnServer({ config, logger }, entryPointPath, args);
    });
  };
  logger.debug('Initial compilation');
  compile();
  const watcher: Object = chokidar.watch([
    path.join(process.cwd(), '**/*'),
  ], {
    ignored: [
      /build\/server/,
      /gluestick\/clientEntryInit/,
      /node_modules\/(?!gluestick\/src)/,
    ],
  }).on('ready', () => {
    logger.info('Started watching...');
    watcher.on('all', (stat, file) => {
      logger.info(`File ${filename(file)} changed [${stat}]`);
      compile();
    });
  });
};
