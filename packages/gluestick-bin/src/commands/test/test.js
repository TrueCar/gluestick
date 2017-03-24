/* @flow */

import type { Context, Logger } from '../../types.js';

const fs = require('fs');
const spawn = require('cross-spawn').spawn;
const path = require('path');

// This is a necessary hack to find Jest depending if node_modules has flatten dependencies or not
const JEST_PATH = `${require.resolve('jest').split('jest')[0]}.bin/jest`;
const JEST_DEBUG_CONFIG_PATH = path.join(__dirname, 'jestEnvironmentNodeDebug.js');
const TEST_MOCKS_PATH = `${path.join(__dirname)}`;

const getJestDefaultConfig = (aliases: Object, webpackRules: RegExp[]): string[] => {
  const moduleNameMapper = {};

  // Handling Static Assets = mock them out
  const fileRegex: RegExp = new RegExp(
    `${webpackRules[3].source}|${webpackRules[4].source}|${webpackRules[5].source}`,
  );
  moduleNameMapper[fileRegex.source] = `${TEST_MOCKS_PATH}/fileMock.js`;
  const stylesRegex: RegExp = new RegExp(`${webpackRules[1].source}|${webpackRules[2].source}`);
  moduleNameMapper[stylesRegex.source] = `${TEST_MOCKS_PATH}/styleMock.js`;

  // We map webpack aliases from webpack-isomorphic-tools-config file
  // so Jest can detect them in tests too
  Object.keys(aliases).forEach((key) => {
    moduleNameMapper[`^${key}(.*)$`] = `${aliases[key]}$1`;
  });

  const roots: string[] = ['src'];
  if (fs.existsSync(path.join(process.cwd(), 'test'))) {
    // Previous to gluestick 1.0, projects used to have test folder, if that folder is not present
    // and we add it to the roots, the watch mode of Jest will fail: ENOENT
    roots[roots.length] = 'test';
  }

  const config = {
    testRegex: '\\/__tests__\\/.*\\.(test|spec)\\.jsx?$',
    moduleNameMapper,
    roots,
    transformIgnorePatterns: [
      '/node_modules/(?!gluestick-addon-)',
    ],
    // Clear watchman warnings (including the one of `test` folder non-existing for new projects)
    // Might be worth in the future to come back here and see if there is a really difference
    // using watchman or not
    watchman: false,
  };

  const argv: string[] = [];
  argv.push('--config', JSON.stringify(config));
  return argv;
};

const getDebugDefaultConfig = (
  logger: Logger, aliases: Object, webpackRules: RegExp[], options: string[],
): string[] => {
  const argv = [];
  argv.push('--inspect');
  argv.push('--debug-brk');
  argv.push(JEST_PATH);
  argv.push('--env');
  argv.push(JEST_DEBUG_CONFIG_PATH);
  argv.push(...getJestDefaultConfig(aliases, webpackRules));
  argv.push('-i');
  argv.push('--watch');
  // Exclude those options to avoid dublication.
  const optionsToExclude = [
    { value: '-D' },
    { value: '--debug-test' },
    { value: '-i', printMsg: true },
    { value: '--runInBand', printMsg: true },
    { value: '--watch', printMsg: true },
    { value: '--config', printMsg: true },
    { value: '-c', printMsg: true },
  ];
  return argv.concat(
    options.filter((option: string): boolean => {
      return optionsToExclude.findIndex((optionToExclude: Object): boolean => {
        const check = new RegExp(`^${optionToExclude.value}.*`).test(option);
        if (check && optionToExclude.printMsg) {
          logger.info(`Option '${optionToExclude.value}' is always set by default in debug mode`);
        }
        return check;
      }) === -1;
    }),
  );
};

module.exports = (context: Context, ...commandArguments: any[]) => {
  const spawnOptions = {
    stdio: 'inherit',
  };
  // $FlowFixMe
  const aliases: Object = context.config.webpackConfig.client.resolve.alias;
  // $FlowFixMe
  const webpackRules: RegExp[] = context.config.webpackConfig.client.module.rules.map(
    rule => rule.test,
  );
  const options: Object = commandArguments[commandArguments.length - 1];
  const rawOptions: string[] = options.parent.rawArgs.slice(3);
  if (options.debugTest) {
    const argvDebug: string[] = getDebugDefaultConfig(
      context.logger, aliases, webpackRules, rawOptions,
    );
    spawn.sync('node', argvDebug, spawnOptions);
  } else {
    const jest = require('jest');
    const argv: string[] = getJestDefaultConfig(aliases, webpackRules).concat(rawOptions);
    // Since we require Jest programmatically, we need to make sure
    // to set NODE_ENV='test' when running it
    process.env.NODE_ENV = 'test';
    jest.run(argv);
  }
};
