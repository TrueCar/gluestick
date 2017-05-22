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

const getCompileWebpackConfig = () => require('../config/compileWebpackConfig');

// Get options object from command arguments
const getOptions = commandArguments => commandArguments[commandArguments.length - 1];

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
const getPlugins = (
  logger: Logger, pluginsConfigPath = path.join(process.cwd(), 'src/gluestick.plugins.js'),
): ConfigPlugin[] => {
  const plugins: ConfigPlugin[] = prepareConfigPlugins(logger, pluginsConfigPath);
  // $FlowIgnore pass additional data as a property
  plugins.pluginsConfigPath = pluginsConfigPath;
  return plugins;
};

// Compile gluestick config
const getGluestickConfig = (
  logger: Logger, plugins: ConfigPlugin[], options: { [key: string]: any } = {},
): GSConfig => {
  const config: GSConfig = compileGlueStickConfig(logger, plugins, options);
  // $FlowIgnore get additional data from a property
  config.pluginsConfigPath = plugins.pluginsConfigPath;
  return config;
};

// Compile webpack configs
const getWebpackConfig = (
  logger: Logger,
  plugins: ConfigPlugin[],
  gluestickConfig: GSConfig,
  options: Object,
): CompiledConfig => {
  return getCompileWebpackConfig()(logger, plugins, gluestickConfig, {
    skipClientEntryGeneration: false,
    skipServerEntryGeneration: false,
    ...options,
  });
};

// Compile both gluestick config and webpack configs
const getContextConfig = (logger: Logger, webpackOptions = {}): Config => {
  const plugins = getPlugins(logger);
  const gluestickConfig = getGluestickConfig(logger, plugins);

  return {
    GSConfig: gluestickConfig,
    webpackConfig: getWebpackConfig(
      logger, plugins, gluestickConfig, webpackOptions,
    ),
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
