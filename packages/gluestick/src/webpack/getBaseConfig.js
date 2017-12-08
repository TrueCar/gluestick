/* @flow */

const path = require('path');

const buildClientEntrypoints = require('./utils/buildClientEntrypoints');
const buildServerEntrypoints = require('./utils/buildServerEntrypoints');

const clientConfig = require('./config/client');
const serverConfig = require('./config/server');

/**
 * 
 * 
 * @param {any} { entries } 
 */
module.exports = function getBaseConfig(
  {
    entries,
    noProgress,
    clientPlugins,
    serverPlugins,
    skipClientEntryGeneration,
    skipServerEntryGeneration,
  },
  { logger, gluestickConfig },
) {
  const clientEntrypoints = skipClientEntryGeneration
    ? {}
    : buildClientEntrypoints(gluestickConfig, logger, entries, clientPlugins);

  if (!skipServerEntryGeneration) {
    buildServerEntrypoints(gluestickConfig, logger, entries, serverPlugins);
  }

  const serverEntry = path.join(__dirname, '../renderer/entry.js');

  return {
    client: clientConfig(
      { entries: clientEntrypoints, noProgress },
      { logger },
    ),
    server: serverConfig({ entries: serverEntry, noProgress }, { logger }),
    vendorDll: null,
  };
};
