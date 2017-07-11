/* @flow */

import type { CommandAPI, Logger, Config } from '../../types.js';

const fs = require('fs');
const spawn = require('cross-spawn').spawn;
const path = require('path');

// This is a necessary hack to find Jest depending if node_modules has flatten dependencies or not
const JEST_PATH = `${require.resolve('jest').split('jest')[0]}.bin/jest`;
const JEST_DEBUG_CONFIG_PATH = path.join(
  __dirname,
  'jestEnvironmentNodeDebug.js',
);
const TEST_MOCKS_PATH = `${path.join(__dirname)}`;

const mergeCustomConfig = (defaultConfig: Object, aliases: Object): Object => {
  const customConfig: Object = require(path.join(process.cwd(), 'package.json'))
    .jest;

  const config = Object.keys(
    customConfig || {},
  ).reduce((prev: Object, curr: string): Object => {
    let value: any = null;
    if (
      Array.isArray(customConfig[curr]) &&
      Array.isArray(defaultConfig[curr])
    ) {
      value = defaultConfig[curr].concat(customConfig[curr]);
    } else if (
      Object.prototype.toString.call(customConfig[curr]) !== '[object Object]'
    ) {
      value = customConfig[curr];
    } else {
      value = { ...defaultConfig[curr], ...customConfig[curr] };
    }
    return {
      ...prev,
      [curr]: value,
    };
  }, defaultConfig);

  // Make sure aliases go always at the end of moduleNameMapper
  // as Jest checks precedence inside this object
  Object.keys(aliases).forEach(key => {
    config.moduleNameMapper[`^${key}(.*)$`] = `${aliases[key]}$1`;
  });

  return config;
};

const getJestDefaultConfig = (aliases: Object): string[] => {
  const moduleNameMapper = {};

  // Handling Static Assets = mock them out
  moduleNameMapper[
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$'
  ] = `${TEST_MOCKS_PATH}/fileMock.js`;
  moduleNameMapper[
    '\\.(css|scss|sass|less)$'
  ] = `${TEST_MOCKS_PATH}/styleMock.js`;

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
    transformIgnorePatterns: ['/node_modules/(?!gluestick)'],
    // Clear watchman warnings (including the one of `test` folder non-existing for new projects)
    // Might be worth in the future to come back here and see if there is a really difference
    // using watchman or not
    watchman: false,
  };

  const argv: string[] = [];
  argv.push('--config', JSON.stringify(mergeCustomConfig(config, aliases)));
  return argv;
};

const getDebugDefaultConfig = (
  logger: Logger,
  aliases: Object,
  options: string[],
): string[] => {
  const argv = [];
  argv.push('--inspect');
  argv.push('--debug-brk');
  argv.push(JEST_PATH);
  argv.push('--env');
  argv.push(JEST_DEBUG_CONFIG_PATH);
  argv.push(...getJestDefaultConfig(aliases));
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
      return (
        optionsToExclude.findIndex((optionToExclude: Object): boolean => {
          const check = new RegExp(`^${optionToExclude.value}.*`).test(option);
          if (check && optionToExclude.printMsg) {
            logger.info(
              `Option '${optionToExclude.value}' is always set by default in debug mode`,
            );
          }
          return check;
        }) === -1
      );
    }),
  );
};

module.exports = (
  { getLogger, getOptions, getContextConfig }: CommandAPI,
  commandArguments: any[],
) => {
  const spawnOptions = {
    stdio: 'inherit',
  };
  const logger: Logger = getLogger();

  logger.clear();
  logger.printCommandInfo();

  const config: Config = getContextConfig(logger, {
    skipClientEntryGeneration: true,
    skipServerEntryGeneration: true,
  });
  // $FlowFixMe
  const aliases: Object = config.webpackConfig.client.resolve.alias;
  const options: Object = getOptions(commandArguments);
  const rawOptions: string[] = options.parent.rawArgs.slice(3);
  if (options.debugTest) {
    const argvDebug: string[] = getDebugDefaultConfig(
      logger,
      aliases,
      rawOptions,
    );
    spawn.sync('node', argvDebug, spawnOptions);
  } else {
    const jest = require('jest');
    const argv: string[] = getJestDefaultConfig(aliases).concat(rawOptions);
    // Since we require Jest programmatically, we need to make sure
    // to set NODE_ENV='test' when running it
    process.env.NODE_ENV = 'test';
    jest.run(argv);
  }
};
