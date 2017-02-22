/* @flow */
import type { Context } from '../../types';

const { spawn } = require('cross-spawn');
const chokidar = require('chokidar');

type Process = {
  kill: Function,
  on: Function,
};

const watchSource = (watchDirectories: string[], callback: Function): void => {
  let timeout: number = -1;
  const watcher: Object = chokidar.watch(watchDirectories, {
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

const debug = (
  { config, logger }: Context,
  serverEntrypointPath: string,
  args: string[],
  debugPort: number,
): Process => {
  const debugSpawn: Process = spawn(
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

module.exports = (
  { config, logger }: Context,
  serverEntrypointPath: string,
  args: string[],
  debugPort: number,
) => {
  let debugProcess: ?Process = null;
  watchSource(config.GSConfig.debugWatchDirectories, () => {
    if (debugProcess) {
      debugProcess.kill();
    }

    process.nextTick(() => {
      debugProcess = debug({ config, logger }, serverEntrypointPath, args, debugPort);
    });
  });
  debugProcess = debug({ config, logger }, serverEntrypointPath, args, debugPort);
};
