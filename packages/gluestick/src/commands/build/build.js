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
  { getOptions, getLogger, getContextConfig }: CommandAPI, commandArgs: any[],
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

  const config = getContextConfig(logger, webpackOptions);

  const compilationErrorHandler = (type: string) => error => {
    logger.clear();
    logger.fatal(`${type[0].toUpperCase()}${type.slice(1)} compilation failed`, error);
  };

  let clientCompilation = Promise.resolve();
  if (options.client) {
    clearBuildDirectory(config.GSConfig, 'client');
    // if (options.buildVendor || !vendorDll.isValid()) {
    //   config.webpackConfig.vendor = vendorDll.getConfig({ logger, config });
    //   clientCompilation = compile({ logger, config }, options, 'vendor')
    // }
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
