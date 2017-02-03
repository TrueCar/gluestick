/* @flow */

import type { Context } from '../types.js';

const spawn = require('cross-spawn').spawn;
const path = require('path');
const configTools = require('../config/webpack-isomorphic-tools-config');

// This is a necessary hack to find Jest depending if node_modules has flatten dependencies or not
const JEST_PATH = `${require.resolve('jest').split('jest')[0]}.bin/jest`;
const JEST_DEBUG_CONFIG_PATH = `${path.join(__dirname, '..', '..', 'test')}/jestEnvironmentNodeDebug.js`;

function getJestDefaultConfig() {
  const alias = configTools.alias;
  const moduleNameMapper = {};

  // We map webpack aliases from webpack-isomorphic-tools-config file
  // so Jest can detect them in tests too
  Object.keys(alias).forEach((key) => {
    moduleNameMapper[`^${key}(.*)$`] = `${alias[key]}$1`;
  });

  const config = {
    moduleNameMapper,
    testPathDirs: ['test'],
  };

  const argv = [];
  argv.push('--config', JSON.stringify(config));
  return argv;
}

function getDebugDefaultConfig() {
  const argv = [];
  argv.push('--inspect');
  argv.push('--debug-brk');
  argv.push(JEST_PATH);
  argv.push('--env');
  argv.push(JEST_DEBUG_CONFIG_PATH);
  argv.push(...getJestDefaultConfig());
  argv.push('-i');
  argv.push('--watch');
  return argv;
}

function createArgs(defaultArgs, options) {
  const argv = [].concat(defaultArgs);
  const { coverage, watch, pattern } = options;

  if (coverage) {
    argv.push('--coverage');
  }
  if (watch) {
    argv.push('--watch');
  }
  if (pattern) {
    argv.push(pattern);
  }

  return argv;
}

module.exports = (context: Context, options: { [key: string]: string }) => {
  const spawnOptions = {
    stdio: 'inherit',
  };

  if (options.debugTest) {
    const argvDebug = getDebugDefaultConfig();
    spawn.sync('node', argvDebug, spawnOptions);
  } else {
    const jest = require('jest');
    const argv = createArgs(getJestDefaultConfig(), options);
    // Since we require Jest programmatically, we need to make sure
    // to set NODE_ENV='test' when running it
    process.env.NODE_ENV = 'test';
    jest.run(argv);
  }
};
