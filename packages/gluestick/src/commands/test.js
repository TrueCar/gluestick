/* @flow */

import type { Context } from '../types.js';

const spawn = require('cross-spawn').spawn;
const path = require('path');

// This is a necessary hack to find Jest depending if node_modules has flatten dependencies or not
const JEST_PATH = `${require.resolve('jest').split('jest')[0]}.bin/jest`;
const JEST_DEBUG_CONFIG_PATH = `${path.join(__dirname, '..', '..', 'jest')}/jestEnvironmentNodeDebug.js`;

const getJestDefaultConfig = aliases => {
  const moduleNameMapper = {};

  // We map webpack aliases from webpack-isomorphic-tools-config file
  // so Jest can detect them in tests too
  Object.keys(aliases).forEach((key) => {
    moduleNameMapper[`^${key}(.*)$`] = `${aliases[key]}$1`;
  });

  const config = {
    moduleNameMapper,
    testPathDirs: ['test'],
  };

  const argv = [];
  argv.push('--config', JSON.stringify(config));
  return argv;
};

const getDebugDefaultConfig = aliases => {
  console.log(aliases);
  const argv = [];
  argv.push('--inspect');
  argv.push('--debug-brk');
  argv.push(JEST_PATH);
  argv.push('--env');
  argv.push(JEST_DEBUG_CONFIG_PATH);
  argv.push(...getJestDefaultConfig(aliases));
  argv.push('-i');
  argv.push('--watch');
  return argv;
};

const createArgs = (defaultArgs, options) => {
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
};

module.exports = (context: Context, options: { [key: string]: string }) => {
  const spawnOptions = {
    stdio: 'inherit',
  };
  // $FlowFixMe
  const aliases: Object = context.config.webpackConfig.resolve.alias;
  if (options.debugTest) {
    const argvDebug = getDebugDefaultConfig(aliases);
    spawn.sync('node', argvDebug, spawnOptions);
  } else {
    const jest = require('jest');
    const argv = createArgs(getJestDefaultConfig(aliases), options);
    // Since we require Jest programmatically, we need to make sure
    // to set NODE_ENV='test' when running it
    process.env.NODE_ENV = 'test';
    jest.run(argv);
  }
};
