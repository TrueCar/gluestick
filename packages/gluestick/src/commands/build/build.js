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
  static: boolean | string;
  vendor: boolean;
  skipIfOk: boolean;
  app?: string;
}

module.exports = (
  { getOptions, getLogger, getContextConfig, getGluestickConfig, getPlugins }: CommandAPI,
  commandArgs: any[],
): void => {
  const options: CommandOptions = getOptions(commandArgs);
  const logger: Logger = getLogger();
  logger.clear();
  logger.printCommandInfo();

  const compilationErrorHandler = (type: string) => error => {
    logger.clear();
    logger.fatal(`${type[0].toUpperCase()}${type.slice(1)} compilation failed`, error);
  };

  // If neither server not client flag is passed
  // set them both to true to compile both client and server.
  if (!options.client && !options.server) {
    options.client = true;
    options.server = true;
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

  if (options.vendor) {
    const plugins = getPlugins(logger);
    const config: Object = {
      GSConfig: getGluestickConfig(logger, plugins),
      webpackConfig: {} // Don't need client and server configs, since we will add vendor config
    };
    const vendorDllConfig = vendorDll.getConfig({ logger, config }, plugins);
    config.webpackConfig.vendor = vendorDllConfig;
    if (!options.skipIfOk || !vendorDll.isValid({ logger, config })) {
      clearBuildDirectory(config.GSConfig, 'dlls');
      compile({ logger, config }, options, 'vendor')
        .then(() => {
          vendorDll.injectValidationMetadata({ logger, config });
        })
        .catch(compilationErrorHandler('vendor'));
    }
  } else {
    const config = getContextConfig(logger, webpackOptions);
    let clientCompilation = Promise.resolve();
    if (options.client) {
      if (!options.app) {
        clearBuildDirectory(config.GSConfig, 'client');
      }
      clientCompilation = compile({ logger, config }, options, 'client')
        .catch(compilationErrorHandler('client'));
    }

    if (options.server) {
      clearBuildDirectory(config.GSConfig, 'server');
      Promise.all([
        compile({ logger, config }, options, 'server').catch(compilationErrorHandler('server')),
        clientCompilation,
      ]).then(() => {
        return options.static
          ? getEntiresSnapshots(
              { config, logger },
              options.app,
              typeof options.static === 'string' ? options.static : null,
            )
          : Promise.resolve();
      });
    }
  }
};
