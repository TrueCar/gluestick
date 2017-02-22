/* @flow */
import type { Context } from '../types.js';

const spawn = require('cross-spawn');
const autoUpgrade = require('../autoUpgrade/autoUpgrade');

type StartOptions = {
  runTests: boolean;
  skipBuild: boolean;
  parent: Object;
};

module.exports = async ({ config, logger }: Context, options: StartOptions) => {
  await autoUpgrade({ config, logger });
  const isProduction: boolean = process.env.NODE_ENV === 'production';

  // Start tests only they asked us to or we are in production mode
  if (!isProduction && options.runTests) {
    spawn('gluestick', ['test', ...options.parent.rawArgs.slice(4)], {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'test',
      },
    });
  }

  if (!(isProduction && options.skipBuild)) {
    spawn('gluestick', ['start-client'], {
      stdio: 'inherit',
      env: { ...process.env },
    });
  }

  spawn('gluestick', ['start-server', ...options.parent.rawArgs.slice(3)], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: isProduction ? 'production' : 'development',
    },
  });
};
