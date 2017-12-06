/* @flow */

const buildClientEntrypoints = require('./utils/buildClientEntrypoints');

const clientConfig = require('./config/client');

/**
 * 
 * 
 * @param {any} { entries } 
 */
module.exports = function getBaseConfig(
  { entries, noProgress },
  { logger, gluestickConfig },
) {
  const entrypoints = buildClientEntrypoints(
    gluestickConfig,
    logger,
    entries,
    [],
  );

  return {
    client: clientConfig({ entries: entrypoints, noProgress }, { logger }),
    server: null,
    vendorDll: null,
  };
};
