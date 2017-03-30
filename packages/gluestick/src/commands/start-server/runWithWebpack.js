/* @flow */
import type { Context, WebpackConfigEntry } from '../../types';

const webpack = require('webpack');
const { spawn } = require('cross-spawn');
const chokidar = require('chokidar');
const path = require('path');
const { filename } = require('../../cli/colorScheme');
const logMessage = require('./logMessage');

function debounce(func, wait, immediate) {
  let timeout;

  // Calling debounce returns a new anonymous function
  return (...args) => {
    // Should the function be called now? If immediate is true
    //   and not already in a timeout then the answer is: Yes
    const callNow = immediate && !timeout;

    // This is the basic debounce behaviour where you can call this 
    //   function several times, but it will only execute once 
    //   [before or after imposing a delay]. 
    //   Each time the returned function is called, the timer starts over.
    clearTimeout(timeout);

    // Set the new timeout
    timeout = setTimeout(() => {
      // Inside the timeout function, clear the timeout variable
      // which will let the next execution run when in 'immediate' mode
      timeout = null;

      // Check if the function already ran with the immediate flag
      if (!immediate) {
        // Call the original function with apply
        // apply lets you define the 'this' object as well as the arguments 
        //    (both captured before setTimeout)
        func(...args);
      }
    }, wait);

    // Immediate mode and no wait timer? Execute the function..
    if (callNow) func(...args);
  };
}

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
  const compile = (): void => {
    logger.info('Building server entry.');
    webpack(webpackConfig).run(error => {
      if (error) {
        throw error;
      }
      if (child) {
        child.kill();
      }
      child = spawnServer({ config, logger }, entryPointPath, args);
    });
  };
  logger.debug('Initial compilation');
  compile();
  const debouncedCompile = debounce(() => {
    compile();
  }, 10000);
  const watcher: Object = chokidar.watch([
    path.join(process.cwd(), '**/*'),
  ], {
    ignored: [
      /\.DS_Store/,
      /build\/server/,
      /gluestick\/clientEntryInit/,
      /node_modules\/(?!gluestick\/src\/renderer)/,
    ],
  }).on('ready', () => {
    logger.info('Started watching...');
    watcher.on('all', (stat, file) => {
      logger.info(`File ${filename(file)} changed [${stat}]`);
      debouncedCompile();
    });
  });
};
