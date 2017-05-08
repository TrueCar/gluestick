/* @flow */
import type { Logger, CommandAPI, ConfigPlugin, GSConfig, CompiledConfig, Config } from '../types.js';

const path = require('path');
const loggerFactory = require('./logger');
const prepareConfigPlugins = require('../plugins/prepareConfigPlugins');
const compileWebpackConfig = require('../config/compileWebpackConfig');
const compileGlueStickConfig = require('../config/compileGlueStickConfig');

const getOptions = commandArguments => commandArguments[commandArguments.length - 1];

const getLogger = (level: string = 'info'): Logger => loggerFactory(level);

const isGluestickProject = (packagePath: string = process.cwd()): boolean => {
  try {
    const packageJson = require(path.join(packagePath, 'package.json'));
    return !!packageJson.dependencies.gluestick;
  } catch (error) {
    return false;
  }
};

const getPlugins = (
  logger: Logger, pluginsConfigPath = path.join(process.cwd(), 'src/gluestick.plugins.js'),
): ConfigPlugin[] => {
  const plugins: ConfigPlugin[] = prepareConfigPlugins(logger, pluginsConfigPath);
  // $FlowIgnore pass additional data as a property
  plugins.pluginsConfigPath = pluginsConfigPath;
  return plugins;
};

const getGluestickConfig = (
  logger: Logger, plugins: ConfigPlugin[], projectConfig: Object,
): GSConfig => {
  const config: GSConfig = compileGlueStickConfig(logger, plugins, projectConfig);
  if (config) {
    // $FlowIgnore get additional data from a property
    config.pluginsConfigPath = plugins.pluginsConfigPath;
  }
  return config;
};

const getWebpackConfig = (
  logger: Logger,
  plugins: ConfigPlugin[],
  projectConfig: Object,
  gluestickConfig: GSConfig,
  options: Object,
): CompiledConfig => {
  return compileWebpackConfig(logger, plugins, projectConfig, gluestickConfig, {
    skipClientEntryGeneration: false,
    skipServerEntryGeneration: false,
    ...options,
  });
};

const getContextConfig = (logger: Logger, webpackOptions = {}): Config => {
  const projectConfig = {};
  const plugins = getPlugins(logger);
  const gluestickConfig = getGluestickConfig(logger, plugins, projectConfig);

  return {
    GSConfig: gluestickConfig,
    webpackConfig: getWebpackConfig(
      logger, plugins, projectConfig, gluestickConfig, webpackOptions,
    ),
  };
};

// safelyExec

// execHooks

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
