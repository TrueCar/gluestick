/* @flow */
import type {
  Logger,
  CommandAPI,
  ConfigPlugin,
  GSConfig,
  CompiledConfig,
  Config,
} from '../types.js';

const path = require('path');
const loggerFactory = require('./logger');
const prepareConfigPlugins = require('../plugins/prepareConfigPlugins');
const compileGlueStickConfig = require('../config/compileGlueStickConfig');
const { pluginsConfigPath } = require('../config/defaults/glueStickConfig');

const _getWebpackConfig = require('../webpack/getWebpackConfig');

// Get options object from command arguments
const getOptions = commandArguments =>
  commandArguments[commandArguments.length - 1];

// Get logger instance
const getLogger = (level: string = 'info'): Logger => loggerFactory(level);

// Check if command is being run in gluestick project
const isGluestickProject = (packagePath: string = process.cwd()): boolean => {
  try {
    const packageJson = require(path.join(packagePath, 'package.json'));
    return !!packageJson.dependencies.gluestick;
  } catch (error) {
    return false;
  }
};

// Get pluging array
const getPlugins = (logger: Logger): ConfigPlugin[] => {
  return prepareConfigPlugins(
    logger,
    path.join(process.cwd(), pluginsConfigPath),
  );
};

// Compile gluestick config
const getGluestickConfig = (
  logger: Logger,
  plugins: ConfigPlugin[],
): GSConfig => {
  return compileGlueStickConfig(logger, plugins);
};

// Compile webpack configs
const getWebpackConfig = (
  logger: Logger,
  plugins: ConfigPlugin[],
  gluestickConfig: GSConfig,
  options: Object,
): CompiledConfig => {
  return _getWebpackConfig(logger, plugins, {
    skipClientEntryGeneration: false,
    skipServerEntryGeneration: false,
    ...options,
  });
};

// Compile both gluestick config and webpack configs
const getContextConfig = (
  logger: Logger,
  webpackOptions = {},
  noProgress: boolean,
): Config => {
  const plugins = getPlugins(logger);
  const gluestickConfig = getGluestickConfig(logger, plugins);

  return {
    GSConfig: gluestickConfig,
    webpackConfig: getWebpackConfig(logger, plugins, gluestickConfig, {
      ...webpackOptions,
      noProgress,
    }),
  };
};

const commandApi: CommandAPI = {
  getOptions,
  getLogger,
  isGluestickProject,
  getPlugins,
  getGluestickConfig,
  getWebpackConfig,
  getContextConfig,
};

module.exports = commandApi;
