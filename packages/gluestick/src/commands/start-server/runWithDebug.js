/* @flow */
import type { Context, WebpackConfigEntry } from '../../types';

const { spawn } = require('cross-spawn');
const chokidar = require('chokidar');
const webpack = require('webpack');
const logMessage = require('./logMessage');

type Process = {
  kill: Function,
  on: Function,
};

/**
 * Watch for changes in server source files then execute given callback.
 */
const watchSource = (watchDirectories: string[], callback: Function): void => {
  let timeout: number = -1;
  const watcher: Object = chokidar.watch(watchDirectories, {
    ignored: /[/\\]\./,
    persistent: true,
  }).on('ready', () => {
    watcher.on('all', () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        callback();
      }, 250);
    });
  });
};

/**
 * Compile server bundle and execute given callback.
 */
const compile = ({ config, logger }: Context, cb: Function): void => {
  const webpackConfig: WebpackConfigEntry = config.webpackConfig.server;
  logger.info('Compiling server bundle...');
  webpack(webpackConfig).run(error => {
    if (error) {
      throw error;
    }
    cb();
  });
};

/**
 * Spawn debugger process and print help messages.
 */
const debug = (
  { config, logger }: Context,
  serverEntrypointPath: string,
  args: string[],
  debugPort: number,
): Process => {
  const debugProcess = spawn(
    'node',
    [
      `--inspect${debugPort ? `=${debugPort}` : ''}`,
      '--debug-brk',
      serverEntrypointPath,
    ].concat(args),
    {
      stdio: ['ipc', 'inherit', 'inherit'],
      env: Object.assign({}, process.env, { NODE_ENV: 'debug' }),
    },
  );

  // Create channel to log messages from debug process.
  logMessage(logger, debugProcess);

  debugProcess.on('error', processError => {
    logger.error(processError);
  });
  return debugProcess;
};

module.exports = (
  { config, logger }: Context,
  serverEntrypointPath: string,
  args: string[],
  debugPort: number,
) => {
  let debugProcess: ?Process = null;
  watchSource(config.GSConfig.debugWatchDirectories, () => {
    compile({ config, logger }, () => {
      if (debugProcess) {
        debugProcess.kill();
      }

      process.nextTick(() => {
        debugProcess = debug({ config, logger }, serverEntrypointPath, args, debugPort);
      });
    });
  });
  compile({ config, logger }, () => {
    debugProcess = debug({ config, logger }, serverEntrypointPath, args, debugPort);
  });
};
