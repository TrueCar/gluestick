const path = require('path');
const runWithWebpack = require('./runWithWebpack');
const runWithPM2 = require('./runWithPM2');
const runWithDebug = require('./runWithDebug');

const getServerEntry = config => {
  return {
    path: path.join(__dirname, '../../renderer/index.js'),
    args: [
      `assetsPath=${config.GSConfig.assetsPath}`,
      `port=${config.GSConfig.ports.server}`,
    ],
  };
};

/**
 * Starts server side rendering.
 * If debug is false, this will use PM2 in production for
 * managing multiple instances.
 *
 * @param {any} { config, logger } Context
 * @param {any} { debug = false, debugPort }
 */
module.exports = ({ config, logger }, { debug = false, debugPort }) => {
  const entry = getServerEntry(config);
  if (debug) {
    runWithDebug({ config, logger }, entry.path, entry.args, debugPort);
  } else if (process.env.NODE_ENV === 'production') {
    runWithPM2({ config, logger }, entry.path, entry.args);
  } else {
    runWithWebpack({ config, logger }, entry.path, entry.args);
  }
};
