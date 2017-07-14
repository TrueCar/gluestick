/* @flow */
import type { CommandAPI, Logger } from '../../types';

const runWithWebpack = require('./runWithWebpack');
const runWithPM2 = require('./runWithPM2');
const runWithDebug = require('./runWithDebug');

type Options = {
  entrypoints?: string,
  logLevel?: string,
  debugServer?: boolean,
  debugPort: number,
  app?: string,
};

type Entry = {
  path: string,
  args: string[],
};

type Settings = {
  printCommandInfo: boolean,
  delayStart: Promise<void>,
};

const getServerEntry = (config: Object): Entry => {
  return {
    path: config.webpackConfig.universalSettings.server.output,
    args: [JSON.stringify(config)],
  };
};

/**
 * Starts server side rendering.
 * If debug is false, this will use PM2 in production for
 * managing multiple instances.
 */
module.exports = (
  { getLogger, getOptions, getContextConfig }: CommandAPI,
  commandArguments: any[],
  { printCommandInfo, delayStart }: Settings = {
    printCommandInfo: true,
    delayStart: Promise.resolve(),
  },
): void => {
  const {
    debugServer,
    debugPort,
    logLevel,
    entrypoints,
    app,
  }: Options = getOptions(commandArguments);
  const logger: Logger = getLogger(logLevel);

  if (printCommandInfo) {
    logger.clear();
    logger.printCommandInfo();
  }

  const config = getContextConfig(logger, {
    skipClientEntryGeneration: true,
    // Performance tweak: if NODE_ENV is production start-server will only run server bundle
    // without creating bundle
    skipServerEntryGeneration: process.env.NODE_ENV === 'production',
    entryOrGroupToBuild: entrypoints || app,
  });

  const entry: Entry = getServerEntry(config);
  if (debugServer) {
    runWithDebug({ config, logger }, entry.path, entry.args, debugPort);
  } else if (process.env.NODE_ENV === 'production') {
    runWithPM2({ config, logger }, entry.path, entry.args);
  } else {
    runWithWebpack({ config, logger }, entry.path, entry.args, delayStart);
  }
};
