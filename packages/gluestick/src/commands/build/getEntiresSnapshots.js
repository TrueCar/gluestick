/* @flow */
import type { CLIContext } from '../../types.js';

const { spawn } = require('cross-spawn');
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');
const mkdir = require('mkdirp');
const { clearBuildDirectory } = require('../utils');
const { promiseEach } = require('../../utils');
const prepareEntries = require('../../config/webpack/prepareEntries');

const spawnRenderer = (entryPointPath: string, args: string) => {
  const child: Object = spawn(
    'node',
    [entryPointPath].concat(args),
    { stdio: ['inherit', 'pipe', 'inherit', 'ipc']/*, env: process.env*/ },
  );
  child.on('error', (error) => {
    throw new Error(error);
  });
  child.on('exit', (code) => {
    if (code && code !== 0) {
      throw new Error(`Renderer process exited with code ${code}`);
    }
  });
  return child;
};

module.exports = ({ config, logger }: CLIContext, app?: string, url: ?string) => {
  logger.info('Creating static markup snapshots...');

  const entryPointPath = config.webpackConfig.universalSettings.server.output;
  const args = JSON.stringify(config);

  let child: Object;

  // Hack: wait for `Renderer listening on port xxxx.` message,
  // otherwise we won't know if it started yet or not.
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      child = spawnRenderer(entryPointPath, args);

      child.on('message', (msg: { type: string, value: any[] }): void => {
        if (msg.value.includes('Renderer listening')) {
          resolve();
        } else if (msg.type === 'ERROR') {
          reject('Renderer failed to start');
        }
      });

      if (process.env.NODE_ENV === 'production') {
        child.stdout.on('data', data => {
          if (data.toString().includes('Renderer listening')) {
            resolve();
          } else if (data.toString().includes('ERROR')) {
            reject('Renderer failed to start');
          }
        });
      }
    }, 2000);
  }).then(() => {
    clearBuildDirectory(config.GSConfig, 'static');
    mkdir.sync(path.join(process.cwd(), config.GSConfig.buildStaticPath));
    return promiseEach(
      Object.keys(prepareEntries(config.GSConfig, app)).map((key: string) => {
        const filename = path.join(
          process.cwd(),
          config.GSConfig.buildStaticPath,
          `${key === '/' ? 'main' : key}.html`,
        );

        return () => fetch(
          `${config.GSConfig.protocol}://${url || config.GSConfig.host}:${config.GSConfig.ports.server}`
          + `${key}`,
        ).then(response => response.text()).then(body => new Promise((resolve, reject) => {
          fs.writeFile(filename, body, 'utf-8', error => {
            if (error) {
              reject(error);
            } else {
              logger.success(`Static for '${key}' created at ${filename}`);
              resolve();
            }
          });
        }).catch(error => {
          logger.error(error);
        }));
      }),
    );
  }).then(() => {
    child.kill();
  }).catch(error => {
    child.kill();
    logger.fatal(error);
  });
};
