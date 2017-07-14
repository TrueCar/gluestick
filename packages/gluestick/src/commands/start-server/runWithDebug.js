/* @flow */
import type { CLIContext, WebpackConfigEntry } from '../../types';

const { spawn } = require('cross-spawn');
const chokidar = require('chokidar');
const webpack = require('webpack');
const fs = require('fs');
const path = require('path');
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
  const watcher: Object = chokidar
    .watch(watchDirectories, {
      ignored: /[/\\]\./,
      persistent: true,
    })
    .on('ready', () => {
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
const compile = ({ config, logger }: CLIContext, cb: Function): void => {
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
  { config, logger }: CLIContext,
  serverEntrypointPath: string,
  args: string[],
  debugPort: number,
): Process => {
  logger.clear();
  logger.warn(
    'If you encouter problems, press ENTER to respawn debug process.',
  );
  logger.warn('Alternatively, press CTRL + C and re-run command.');

  const debugProcess = spawn(
    'node',
    [
      `--inspect${debugPort ? `=${debugPort}` : ''}`,
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
  { config, logger }: CLIContext,
  serverEntrypointPath: string,
  args: string[],
  debugPort: number,
) => {
  // Check if `webpack-chunks.json` is present
  if (
    !fs.existsSync(
      path.join(
        process.cwd(),
        config.GSConfig.buildAssetsPath,
        config.GSConfig.webpackChunks,
      ),
    )
  ) {
    logger.warn(
      '`build/assets/webpack-chunks.json` is not present. Run `gluestick build --client`' +
        " to generare it, otherwise renderer won't work properly.",
    );
  }

  let debugProcess: ?Process = null;
  try {
    // Recompile and respawn debug process on ENTER.
    process.stdin.on('readable', () => {
      const chunk = process.stdin.read();
      if (chunk && chunk.toString() === '\n') {
        if (debugProcess) {
          debugProcess.kill();
        }
        compile({ config, logger }, () => {
          debugProcess = debug(
            { config, logger },
            serverEntrypointPath,
            args,
            debugPort,
          );
        });
      }
    });

    watchSource(config.GSConfig.debugWatchDirectories, () => {
      compile({ config, logger }, () => {
        if (debugProcess) {
          debugProcess.kill();
        }

        process.nextTick(() => {
          debugProcess = debug(
            { config, logger },
            serverEntrypointPath,
            args,
            debugPort,
          );
        });
      });
    });

    compile({ config, logger }, () => {
      debugProcess = debug(
        { config, logger },
        serverEntrypointPath,
        args,
        debugPort,
      );
    });
  } catch (error) {
    // Kill process if exist to prevent it hanging in system
    // causing `Unable to open devtools socket: address already in use` error
    if (debugProcess) {
      debugProcess.kill();
    }
    throw error;
  }
};
