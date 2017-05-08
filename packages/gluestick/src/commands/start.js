/* @flow */
import type { CLIContext } from '../types.js';

const spawn = require('cross-spawn');
const { filterArg } = require('./utils');

const skippedOptions: string[] = [
  '--dev',
  '-P', '--skip-build',
  '-T', '--run-tests',
];

type StartOptions = {
  runTests: boolean;
  skipBuild: boolean;
  parent: Object;
  dev: boolean;
};

const spawnFunc = (args: string[], customEnv: Object = {}): Promise<any> => {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(
      'node',
      [
        './node_modules/.bin/gluestick',
        ...args,
      ],
      {
        stdio: 'inherit',
        env: { ...process.env, ...customEnv },
      },
    );

    childProcess.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command ${args.join(' ')} returned code ${code}`));
      }
    });
    childProcess.on('error', (error) => {
      reject(error);
    });
  });
};

module.exports = ({ config, logger }: CLIContext, options: StartOptions): Promise<any> => {
  const isProduction: boolean = process.env.NODE_ENV === 'production';

  const rawArgs: string[] = filterArg(options.parent.rawArgs, skippedOptions);

  /* gluestick start
   *   -> spawn start-client (w/ build), spawn start-server (w/ build)
   *
   * gluestick start --skip-build
   *   -> gluestick start
   *
   * NODE_ENV=production gluestick start
   *   -> build client, build server, spawn start-server (w/o build)
   *
   * NODE_ENV=production gluestick start --skip-build
   *   -> spawn start-server (w/o build)
   */

  // Start tests only they asked us to or we are in production mode
  if (!isProduction && options.runTests) {
    spawnFunc(
      [
        'test',
        ...rawArgs.slice(4),
      ],
      {
        NODE_ENV: 'test',
      },
    );
  }

  if (!isProduction) {
    spawnFunc([
      'start-client',
      ...rawArgs.slice(3),
    ]);
  }

  if (!isProduction || (isProduction && options.skipBuild)) {
    return spawnFunc([
      'start-server',
      ...rawArgs.slice(3),
    ]);
  }

  if (isProduction && !options.skipBuild) {
    return Promise.all([
      spawnFunc([
        'build',
        ...rawArgs.slice(3),
      ]),
    ]).then(() => {
      spawnFunc([
        'start-server',
        ...rawArgs.slice(3),
      ]);
    }).catch((error) => {
      logger.error(error);
      process.exit(1);
    });
  }

  return Promise.reject(
    new Error('Start failed'),
  );
};
