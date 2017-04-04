/* @flow */
import type { Context } from '../types.js';

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

module.exports = ({ config, logger }: Context, options: StartOptions) => {
  const isProduction: boolean = process.env.NODE_ENV === 'production';

  const rawArgs: string[] = filterArg(options.parent.rawArgs, skippedOptions);

  // Start tests only they asked us to or we are in production mode
  if (!isProduction && options.runTests) {
    spawn('gluestick', ['test', ...rawArgs.slice(4)], {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'test',
      },
    });
  }

  if (!(isProduction && options.skipBuild)) {
    spawn(
      'node',
      [
        './node_modules/.bin/gluestick',
        'start-client',
        ...rawArgs.slice(2),
      ],
      {
        stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
        env: { ...process.env },
      },
    );
  }

  spawn(
    'node',
    [
      './node_modules/.bin/gluestick',
      'start-server',
      ...rawArgs.slice(2),
    ],
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: isProduction ? 'production' : 'development',
      },
    },
  );
};
