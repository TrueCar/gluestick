const path = require('path');
const { spawn } = require('cross-spawn');
const pm2 = require('pm2');
const sha1 = require('sha1');
const chokidar = require('chokidar');
const webpack = require('webpack');

/**
 * Spawns new process with rendering server,
 *
 * @param {any} { config, logger } Context
 */
const spawnServer = ({ config, logger }) => {
  const child = spawn(
    'node',
    [
      path.join(__dirname, '../renderer/index.js'),
      `assetsPath=${config.GSConfig.assetsPath}`,
      `port=${config.GSConfig.ports.server}`,
    ],
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
 */
const runWithWebpack = ({ config, logger }) => {
  const webpackConfig = config.webpackConfig.server.dev;
  let child = null;
  const watcher = webpack(webpackConfig).watch({
    poll: 1000,
  }, error => {
    if (error) {
      throw new Error(error.message);
    }
    logger.info('Building server entry.');
    if (child) {
      child.kill();
    }
    child = spawnServer({ config, logger });
  });
  const closeWatcher = () => {
    watcher.close(() => {
      logger.info('Stopping watcher.');
    });
  };
  process.on('SIGINT', closeWatcher);
};

const watchSource = callback => {
  let timeout;
  chokidar.watch([
    path.join(process.cwd(), 'src/**/*.js'),
    path.join(process.cwd(), 'test/**/*.js'),
  ], {
    ignored: /[/\\]\./,
    persistent: true,
  }).on('all', () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      callback();
    }, 250);
  });
};

const runWithPM2 = ({ config, logger }, name) => {
  const pm2Config = {
    script: config.webpackConfig.universalSettings.server.input,
    name,
    cwd: process.cwd(),
    exec_mode: 'cluster',
    instances: process.env.MAX_INSTANCES || (process.env.NODE_ENV === 'production' ? 1 : 1),
    max_memory_restart: process.env.MAX_MEMORY_RESTART || '200M',
    environment_name: process.env.NODE_ENV,
    no_autorestart: false,
    merge_logs: true,
    watch: false,
  };
  pm2.start(pm2Config, (error, a) => {
    if (error) {
      logger.error(error);
      pm2.disconnect();
    }
    console.log(a);
    /*console.log(spawn(
      `${require.resolve('pm2').split('pm2')[0]}.bin/pm2`,
      ['logs', name, '--raw', '--lines', 0],
      { stdio: 'inherit' },
    ));*/
  });

  /**
   * When the app is quit, we go through all of the processes that were
   * started up because of PM2 and we terminate them.
   */
  process.on('SIGINT', () => {
    // TODO: Replace logger.
    // logger.info(`Stopping pm2 instance: ${name}…`);
    checkIfPM2ProcessExists(name, (exists) => {
      if (exists) {
        // TODO: Replace logger.
        // logger.debug(`Deleting process ${name}`);
        pm2.delete(name, () => {
          pm2.disconnect(() => {
            process.exit();
          });
        });
      } else {
        // TODO: Replace logger.
        // logger.warn(`No process with name ${name} exists`);
        pm2.disconnect(() => {
          process.exit();
        });
      }
    });
  });
};

const checkIfPM2ProcessExists = (name, callback) => {
  pm2.list((error, result) => {
    callback(result.filter(i => i.name === name).length > 0);
  });
};

const runWithDebug = ({ config, logger }, serverEntrypointPath, debugPort) => {
  const debugSpawn = spawn(
    'node',
    [
      '--',
      `--inspect${debugPort ? `=${debugPort}` : ''}`,
      serverEntrypointPath,
    ],
    {
      stdio: 'inherit',
      env: Object.assign({}, process.env, { NODE_ENV: 'development-server' }),
    },
  );
  debugSpawn.on('error', error => {
    logger.error(error);
  });
  return debugSpawn;
};

/**
 * Starts server side rendering. If debug is false, this will use PM2 in production for
 * managing multiple instances.
 *
 * @param {any} { config, logger } Context
 * @param {any} { debug = false, debugPort }
 */
module.exports = ({ config, logger }, { debug = false, debugPort }) => {
  if (debug) {
    /*let debugSpawn;
    watchSource(() => {
      debugSpawn.kill();

      // killing a child process isn't immediate… we need to wait for it to
      // have a chance to complete before restarting
      setTimeout(() => {
        debugSpawn = runWithDebug({ config, logger }, serverEntrypointPath, debugPort);
      }, 500); // check if this can be replaced with process.nextTick
    });
    debugSpawn = runWithDebug({ config, logger }, serverEntrypointPath, debugPort);*/
  } else if (process.env.NODE_ENV === 'production') {
    console.log(0);
    const instanceName = `gluestick-server-${sha1(process.cwd()).substr(0, 7)}`;
    pm2.connect(error => {
      if (error) {
        logger.error(error);
        pm2.disconnect();
        process.exit(1);
      }

      checkIfPM2ProcessExists(instanceName, exists => {
        console.log(exists);
        if (exists) {
          logger.info(`PM2 process ${instanceName} already running, stopping the process`);
          pm2.stop(instanceName, () => {
            runWithPM2({ config, logger }, instanceName, logger);
          });
        } else {
          runWithPM2({ config, logger }, instanceName, logger);
        }
      });
    });
    console.log(10);
  } else {
    runWithWebpack({ config, logger });
  }
};
