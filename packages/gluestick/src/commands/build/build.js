/* @flow */
import type { Logger, CommandAPI } from '../../types.js';

const { clearBuildDirectory } = require('../utils');
const getEntiresSnapshots = require('./getEntiresSnapshots');
const compile = require('./compile');

type CommandOptions = {
  stats: boolean;
  client: boolean;
  server: boolean;
  static: boolean;
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
    options.server = true;
  }

  if (options.static && (!options.client || !options.server)) {
    logger.fatal('--static options must be used with both client and server build');
  }

  const config = getContextConfig(logger, {
    skipClientEntryGeneration: !options.client,
    skipServerEntryGeneration: !options.server,
  });

  const compilationErrorHandler = (type: string) => error => {
    logger.clear();
    logger.fatal(`${type[0].toUpperCase()}${type.slice(1)} compilation failed`, error);
  };

  let clientCompilation = Promise.resolve();
  if (options.client) {
    clearBuildDirectory(config.GSConfig, 'client');
    clientCompilation = compile({ logger, config }, options, 'client')
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
