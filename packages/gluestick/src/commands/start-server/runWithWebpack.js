/* @flow */
import type { Context, WebpackConfigEntry } from '../../types';

const webpack = require('webpack');
const { spawn } = require('cross-spawn');
const chokidar = require('chokidar');
const path = require('path');
const { filename } = require('../../cli/colorScheme');
const logMessage = require('./logMessage');
const { debounce } = require('../../utils');
const progressHandler = require('../../config/webpack/progressHandler');

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
module.exports = ({ config, logger }: Context, entryPointPath: string, args: string[]) => {
  const webpackConfig: WebpackConfigEntry = config.webpackConfig.server;
  let child: ?Object = null;
  const compile = (cb: Function = () => {}): void => {
    logger.info('Building server entry.');
    webpack(webpackConfig).watch({}, error => {
      if (error) {
        throw error;
      }
      if (child) {
        child.kill();
      }

      cb();

      child = spawnServer({ config, logger }, entryPointPath, args);
    });
  };
  logger.debug('Initial compilation');
  compile(() => {
    progressHandler.toggleMute('server');
  });
  const debouncedCompile = debounce(() => {
    compile();
  }, 300);
  const watcher: Object = chokidar.watch([
    path.join(process.cwd(), 'src/**/*'),
    path.join(process.cwd(), 'gluestick/EntryWrapper.js'),
    path.join(process.cwd(), 'node_modules/gluestick/src/renderer/**/*'),
  ], {
    ignored: [
      /(^|[/\\])\../,
      /\.DS_Store/,
    ],
  }).on('ready', () => {
    logger.info('Started watching...');
    watcher.on('all', (stat, file) => {
      logger.info(`File ${filename(file)} changed [${stat}]`);
      debouncedCompile();
    });
  });
};
