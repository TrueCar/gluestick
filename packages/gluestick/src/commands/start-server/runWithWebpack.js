const webpack = require('webpack');
const { spawn } = require('cross-spawn');

/**
 * Spawns new process with rendering server.
 *
 * @param {any} { config, logger } Context
 * @param {string} entryPointPath Path to renderer server entry file
 * @param {Array<string>} args Arguments to pass to entry
 */
const spawnServer = ({ config, logger }, entryPointPath, args) => {
  const child = spawn(
    'node',
    [entryPointPath].concat(args),
    { stdio: ['ipc', 'inherit', 'inherit'] },
  );
  child.on('message', msg => {
    switch (msg.type) {
      default:
      case 'info':
        logger.info(msg.value);
        break;
      case 'warn':
        logger.warn(msg.value);
        break;
      case 'error':
        logger.error(msg.value);
        break;
      case 'success':
        logger.success(msg.value);
        break;
    }
  });
  return child;
};

/**
 * Builds rendering server bundle and runs it.
 *
 * @param {any} { config, logger } Context
 * @param {string} entryPointPath Path to renderer server entry file
 * @param {Array<string>} args Arguments to pass to entry
 */
const runWithWebpack = ({ config, logger }, entryPointPath, args) => {
  const webpackConfig = config.webpackConfig.server;
  let child = null;
  const watcher = webpack(webpackConfig).watch({
    poll: 1000,
  }, error => {
    if (error) {
      throw error;
    }
    logger.info('Building server entry.');
    if (child) {
      child.kill();
    }
    child = spawnServer({ config, logger }, entryPointPath, args);
  });
  const closeWatcher = () => {
    watcher.close(() => {
      logger.info('Stopping watcher.');
    });
  };
  process.on('SIGINT', closeWatcher);
};

module.exports = runWithWebpack;
