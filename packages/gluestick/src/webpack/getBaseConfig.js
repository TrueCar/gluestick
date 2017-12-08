/* @flow */

const buildClientEntrypoints = require('./utils/buildClientEntrypoints');

const clientConfig = require('./config/client');

/**
 * 
 * 
 * @param {any} { entries } 
 */
module.exports = function getBaseConfig(
  { entries, noProgress, plugins },
  { logger, gluestickConfig },
) {
  const entrypoints = buildClientEntrypoints(
    gluestickConfig,
    logger,
    entries,
    plugins,
  );

  return {
    client: clientConfig({ entries: entrypoints, noProgress }, { logger }),
    server: null,
    vendorDll: null,
  };
};
