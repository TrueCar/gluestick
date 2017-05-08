/* @flow */
import type { CLIContext } from '../../types';

const runWithWebpack = require('./runWithWebpack');
const runWithPM2 = require('./runWithPM2');
const runWithDebug = require('./runWithDebug');

type DebugOptions = {
  debugServer?: boolean,
  debugPort: number,
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
  { config, logger }: CLIContext,
  { debugServer = false, debugPort }: DebugOptions,
): void => {
  const entry: Entry = getServerEntry(config);
  if (debugServer) {
    runWithDebug({ config, logger }, entry.path, entry.args, debugPort);
  } else if (process.env.NODE_ENV === 'production') {
    runWithPM2({ config, logger }, entry.path, entry.args);
  } else {
    runWithWebpack({ config, logger }, entry.path, entry.args);
  }
};
