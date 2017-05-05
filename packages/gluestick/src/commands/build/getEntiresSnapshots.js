/* @flow */
import type { Context } from '../../types.js';

const { spawn } = require('cross-spawn');
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');
const mkdir = require('mkdirp');
const { clearBuildDirectory } = require('../utils');

const spawnRenderer = (entryPointPath: string, args: string) => {
  const child: Object = spawn(
    'node',
    [entryPointPath].concat(args),
    { stdio: ['ipc', 'inherit', 'inherit'] },
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

module.exports = ({ config, logger }: Context) => {
  const entryPointPath = config.webpackConfig.universalSettings.server.output;
  const args = JSON.stringify(config);

  const child: Object = spawnRenderer(entryPointPath, args);

  // Hack: wait for `Renderer listening on port xxxx.` message,
  // otherwise we won't know if it started yet or not.
  return new Promise((resolve) => {
    child.on('message', (msg: { type: string, value: any[] }): void => {
      if (msg.value.includes('Renderer listening')) {
        resolve();
      }
    });
  }).then(() => {
    clearBuildDirectory(config.GSConfig, 'static');
    mkdir.sync(path.join(process.cwd(), config.GSConfig.buildStaticPath));
    return Promise.all(
      Object.keys(
        require(path.join(process.cwd(), config.GSConfig.entriesPath)),
      ).map((key: string) => {
        const filename = path.join(
          process.cwd(),
          config.GSConfig.buildStaticPath,
          `${key === '/' ? 'main' : key}.html`,
        );
        return fetch(
          `${config.GSConfig.protocol}://${config.GSConfig.host}:${config.GSConfig.ports.server}`
          + `${key}`,
        ).then(response => response.text()).then(body => new Promise((resolve, reject) => {
          fs.writeFile(
            filename,
            body,
            'utf-8',
            error => {
              if (error) {
                reject(error);
              } else {
                logger.success(`Static for '${key}' created at ${filename}`);
                resolve();
              }
            },
          );
        }));
      }),
    );
  }).then(() => {
    child.kill();
  });
};
