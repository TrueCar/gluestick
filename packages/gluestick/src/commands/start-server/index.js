/* @flow */
import type { CommandAPI, Logger } from '../../types';

const runWithWebpack = require('./runWithWebpack');
const runWithPM2 = require('./runWithPM2');
const runWithDebug = require('./runWithDebug');

type Options = {
  logLevel?: string;
  debugServer?: boolean;
  debugPort: number;
}

type Entry = {
  path: string,
  args: string[],
}

const getServerEntry = (config: Object): Entry => {
  return {
    path: config.webpackConfig.universalSettings.server.output,
    args: [
      JSON.stringify(config),
    ],
  };
};

/**
 * Starts server side rendering.
 * If debug is false, this will use PM2 in production for
 * managing multiple instances.
 *
 * @param {Object} { config, logger } Context
 * @param {Object} { debug = false, debugPort }
 */
module.exports = (
  { getLogger, getOptions, getContextConfig }: CommandAPI,
  commandArguments: any[],
): void => {
  const { debugServer, debugPort, logLevel }: Options = getOptions(commandArguments);
  const logger: Logger = getLogger(logLevel);

  logger.clear();
  logger.printCommandInfo();

  const config = getContextConfig(logger, {
    skipClientEntryGeneration: true,
    // Performance tweak: if NODE_ENV is production start-server will only run server bundle
    // without creating bundle
    skipServerEntryGeneration: process.env.NODE_ENV === 'production',
  });

  const entry: Entry = getServerEntry(config);
  if (debugServer) {
    runWithDebug({ config, logger }, entry.path, entry.args, debugPort);
  } else if (process.env.NODE_ENV === 'production') {
    runWithPM2({ config, logger }, entry.path, entry.args);
  } else {
    runWithWebpack({ config, logger }, entry.path, entry.args);
  }
};
