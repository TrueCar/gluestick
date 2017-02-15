/* @flow */

import type { Context } from '../types.js';

const spawn = require('cross-spawn').spawn;
const path = require('path');

// This is a necessary hack to find Jest depending if node_modules has flatten dependencies or not
const JEST_PATH = `${require.resolve('jest').split('jest')[0]}.bin/jest`;
const JEST_DEBUG_CONFIG_PATH = `${path.join(__dirname, '..', '..', 'jest')}/jestEnvironmentNodeDebug.js`;
// const TEST_MOCKS_PATH = `${path.join(__dirname, '..', '..', 'jest', '__mocks__')}`;

const getJestDefaultConfig = aliases => {
  const moduleNameMapper = {};
  /*
  const images = configTools.assets.images.extensions;
  const other = configTools.assets.other.extensions;
  const styles = configTools.assets.styles.extensions;

  // Handling Static Assets = mock them out
  moduleNameMapper[`^[./a-zA-Z0-9@$_-]+\\.(${images.join('|')}|${other.join('|')})$`]
    = `${TEST_MOCKS_PATH}/fileMock.js`;
  moduleNameMapper[`^[./a-zA-Z0-9@$_-]+\\.(${styles.join('|')})$`]
    = `${TEST_MOCKS_PATH}/styleMock.js`;
  moduleNameMapper[`^[./a-zA-Z0-9$_-]+\\.(${images.join('|')})$`]
    = `${TEST_MOCKS_PATH}/fileMock.js`;
  moduleNameMapper[`^[./a-zA-Z0-9$_-]+\\.(${styles.join('|')})$`]
    = `${TEST_MOCKS_PATH}/styleMock.js`;
  */

  // We map webpack aliases from webpack-isomorphic-tools-config file
  // so Jest can detect them in tests too
  Object.keys(aliases).forEach((key) => {
    moduleNameMapper[`^${key}(.*)$`] = `${aliases[key]}$1`;
  });


  const config = {
    // moduleNameMapper,
    testPathDirs: ['test'],
    transformIgnorePatterns: [
      '/node_modules/(?!gluestick-addon-)',
    ],
  };

  const argv = [];
  argv.push('--config', JSON.stringify(config));
  return argv;
};

const getDebugDefaultConfig = aliases => {
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
