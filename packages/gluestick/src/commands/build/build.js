/* @flow */
import type { Logger, CommandAPI } from '../../types.js';

const { clearBuildDirectory } = require('../utils');
const getEntiresSnapshots = require('./getEntiresSnapshots');
const compile = require('./compile');
const vendorDll = require('../../config/vendorDll');

type CommandOptions = {
  stats: boolean;
  client: boolean;
  server: boolean;
  static: boolean;
  vendor: boolean;
  bailIfOk: boolean;
  app?: string;
}

module.exports = (
  { getOptions, getLogger, getContextConfig, getGluestickConfig, getPlugins }: CommandAPI, commandArgs: any[],
): void => {
  const options: CommandOptions = getOptions(commandArgs);
  const logger: Logger = getLogger();
  logger.clear();
  logger.printCommandInfo();

  // If neither server not client flag is passed
  // set them both to true to compile both client and server.
  if (!options.client && !options.server) {
    options.client = true;
    // If app is passed by default disable server compilation.
    if (options.app) {
      logger.info('Disabling server compilation, you can enable it by passing `--server`');
    }
    options.server = !options.app;
  }

  // If it's vendor compilation disable everything
  if (options.vendor) {
    if (options.client) {
      options.client = false;
      logger.info('Disabling client compilation');
    }
    if (options.server) {
      options.server = false;
      logger.info('Disabling server compilation');
    }
    if (options.static) {
      options.static = false;
      logger.info('Disabling static markup build');
    }
  }

  if (options.static && (!options.client || !options.server)) {
    logger.fatal('--static options must be used with both client and server build');
  }

  const webpackOptions: Object = {
    skipClientEntryGeneration: !options.client,
    skipServerEntryGeneration: !options.server,
  }
  if (options.app) {
    webpackOptions.entryOrGroupToBuild = options.app;
  }

  const plugins = getPlugins(logger);
  const config: Object = options.client || options.server
    ? getContextConfig(logger, webpackOptions)
    : {
      GSConfig: getGluestickConfig(logger, plugins),
      webpackConfig: {} // Don't need client and server configs, since we will add vendor config
    }
  const compilationErrorHandler = (type: string) => error => {
    logger.clear();
    logger.fatal(`${type[0].toUpperCase()}${type.slice(1)} compilation failed`, error);
  };

  if (options.vendor) {
    const vendorDllConfig = vendorDll.getConfig({ logger, config }, plugins);
    if (!options.bailIfOk || !vendorDll.isValid({ logger, config }, vendorDllConfig)) {
      clearBuildDirectory(config.GSConfig, 'dlls');
      config.webpackConfig.vendor = vendorDllConfig;
      compile({ logger, config }, options, 'vendor')
        .then(() => {
          vendorDll.injectValidationMetadata({ config }, vendorDllConfig);
        })
        .catch(compilationErrorHandler('vendor'));
    }
  }

  let clientCompilation = Promise.resolve();
  if (options.client) {
    clearBuildDirectory(config.GSConfig, 'client');
    clientCompilation
      .then(() => compile({ logger, config }, options, 'client'))
      .catch(compilationErrorHandler('client'));
  }

  if (options.server) {
    clearBuildDirectory(config.GSConfig, 'server');
    Promise.all([
      compile({ logger, config }, options, 'server').catch(compilationErrorHandler('server')),
      clientCompilation,
    ]).then(() => {
      return options.static ? getEntiresSnapshots({ config, logger }) : Promise.resolve();
    });
  }
};
