const { spawn } = require('cross-spawn');
const chokidar = require('chokidar');

const watchSource = (watchDirectories, callback) => {
  let timeout = -1;
  const watcher = chokidar.watch(watchDirectories, {
    ignored: /[/\\]\./,
    persistent: true,
  }).on('ready', () => {
    watcher.on('all', () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        callback();
      }, 250);
    });
  });
};

const debug = ({ config, logger }, serverEntrypointPath, args, debugPort) => {
  const debugSpawn = spawn(
    'node',
    [
      `--inspect${debugPort ? `=${debugPort}` : ''}`,
      '--debug-brk',
      serverEntrypointPath,
    ].concat(args),
    {
      stdio: ['ipc', 'inherit', 'inherit'],
      env: Object.assign({}, process.env, { NODE_ENV: 'debug' }),
    },
  );
  debugSpawn.on('error', error => {
    logger.error(error);
  });
  return debugSpawn;
};

module.exports = ({ config, logger }, serverEntrypointPath, args, debugPort) => {
  let debugProcess = null;
  watchSource(config.GSConfig.debugWatchDirectories, () => {
    debugProcess.kill();

    process.nextTick(() => {
      debugProcess = debug({ config, logger }, serverEntrypointPath, args, debugPort);
    });
  });
  debugProcess = debug({ config, logger }, serverEntrypointPath, args, debugPort);
};
