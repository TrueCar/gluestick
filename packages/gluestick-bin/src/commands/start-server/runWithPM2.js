/* @flow */
import type { Context } from '../../types';

const { spawn } = require('cross-spawn');
const pm2 = require('pm2');
const sha1 = require('sha1');
const webpack = require('webpack');

type PM2Config = {
  script: string,
  name: string,
  args: string[],
  cwd: string,
  exec_mode: string,
  instances: string | number,
  max_memory_restart: string,
  environment_name: ?string,
  no_autorestart: boolean,
  merge_logs: boolean,
  watch: boolean,
}

/**
 * Checks if given pm2 process exists.
 *
 * @param {string} name Name of the process
 * @param {Function} callback Callback to execute with results of check
 */
const checkIfPM2ProcessExists = (name: string, callback: Function) => {
  pm2.list((error: string, result: Object[]) => {
    if (error) {
      throw error;
    }
    callback(result.filter(i => i.name === name).length > 0);
  });
};

const start = (
  { config, logger }: Context,
  name: string,
  entryPointPath: string,
  args: string[],
): void => {
  const pm2Config: PM2Config = {
    script: entryPointPath,
    name,
    args,
    cwd: process.cwd(),
    exec_mode: 'cluster',
    instances: process.env.MAX_INSTANCES || (process.env.NODE_ENV === 'production' ? 0 : 1),
    max_memory_restart: process.env.MAX_MEMORY_RESTART || '200M',
    environment_name: process.env.NODE_ENV,
    no_autorestart: false,
    merge_logs: true,
    watch: false,
  };
  const logProcess: Object = spawn(
    `${require.resolve('pm2').split('pm2')[0]}.bin/pm2`,
    ['logs', name, '--raw', '--lines', 0],
    { stdio: 'inherit' },
  );
  // Need to delay server code execution so the log process is ready to show messages.
  setTimeout((): void => {
    pm2.start(pm2Config, (error: string) => {
      if (error) {
        logger.error(error);
        pm2.disconnect();
        logProcess.kill();
      }
      logger.success(`PM2 process ${name} started.`);
    });
  }, 1000);

  /**
   * When the app is quit, we go through all of the processes that were
   * started up because of PM2 and we terminate them.
   */
  process.on('SIGINT', (): void => {
    logger.info(`Stopping pm2 instance: ${name}…`);
    checkIfPM2ProcessExists(name, (exists) => {
      if (exists) {
        logger.info(`Deleting process ${name}.`);
        pm2.delete(name, () => {
          pm2.disconnect(() => {
            process.exit();
          });
        });
      } else {
        logger.warn(`No process with name ${name} exists.`);
        pm2.disconnect(() => {
          process.exit();
        });
      }
    });
  });
};

module.exports = ({ config, logger }: Context, entryPointPath: string, args: string[]) => {
  webpack(config.webpackConfig.server).run(error => {
    if (error) {
      throw error;
    }
    logger.info('Building server entry.');

    const instanceName: string = `gluestick-server-${sha1(process.cwd()).substr(0, 7)}`;
    pm2.connect((err: string) => {
      if (err) {
        logger.error(err);
        pm2.disconnect();
        process.exit(1);
      }

      checkIfPM2ProcessExists(instanceName, (exists: boolean): void => {
        if (exists) {
          logger.info(`PM2 process ${instanceName} already running, stopping the process`);
          pm2.stop(instanceName, () => {
            start({ config, logger }, instanceName, entryPointPath, args);
          });
        } else {
          start({ config, logger }, instanceName, entryPointPath, args);
        }
      });
    });
  });
};
