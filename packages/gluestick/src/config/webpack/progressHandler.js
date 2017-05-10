/* @flow */

import type { Logger } from '../../types';

const chalk = require('chalk');
const webpack = require('webpack');
const ProgressBar = require('progress');

// Compilation states
const compilations = {
  server: {
    muted: false,
    running: true,
    finished: false,
    postprocessing: '',
  },
  client: {
    muted: false,
    running: true,
    finished: false,
    postprocessing: '',
  },
};

/**
 * Original solutions available here: https://github.com/clessg/progress-bar-webpack-plugin
 * The code for progressBarPlugin is almost identical to the one from the link,
 * except for mutin/unmuting code, which was impossible to add using progress-bar-webpack-plugin
 * directy.
 *
 * Compilation can have 3 states:
 * - compiling
 * - postprocessing
 * - rebuilding
 *
 * Compiling and postprocessing are done once at the beginning then only rebuilding cam happen
 * multiple times.
 */
const progressBarPlugin = (logger: Logger, name: string, options = {}) => {
  const stream = options.stream || process.stderr;
  const enabled = stream && stream.isTTY;

  if (!enabled) {
    return () => {};
  }
  if (!logger.pretty) {
    return new webpack.ProgressPlugin();
  }

  const header: string = chalk.bgMagenta.black(`  COMPILATION:${name.toUpperCase()}  `);
  const barFormat: string = `${header} [:bar] ${chalk.green.bold(':percent')} (:elapsed seconds)`;

  const barOptions = {
    complete: '=',
    incomplete: ' ',
    width: 20,
    total: 100,
    clear: true,
    ...(options.barOptions || {}),
  };

  const bar = new ProgressBar(barFormat, barOptions);

  let running = false;
  // let startTime = 0;
  let lastPercent = 0;

  return new webpack.ProgressPlugin((percent, msg) => {
    // If compilation is finished on server, start-server will start postprocessing
    // so log appropriate message
    if (compilations[name].finished && compilations[name].postprocessing === 'init' && name === 'server') {
      compilations[name].postprocessing = 'running';
      stream.write(
        `${header} Postprocessing...`,
      );
    }

    // If compilation is finished and done postprocessing, it means it's in rebuild state
    if (compilations[name].finished && compilations[name].postprocessing === 'done') {
      if (msg === 'compiling') {
        stream.cursorTo(0);
        stream.write(`${header} Rebuilding...`);
      } else if (msg === 'emitting') {
        stream.clearLine();
        stream.cursorTo(0);
        logger.info('Bundle rebuilded');
      }
    }

    // If current compilation is server and is running, mute the client's one
    // If current compilation is client and server is not running, unmute itself
    if (name === 'server' && compilations[name].running) {
      compilations.client.muted = true;
    } else if (name === 'client' && !compilations.server.running) {
      compilations.client.muted = false;
    }

    const shouldUpdate = !compilations[name].muted && !compilations[name].finished;

    // if (!running && lastPercent !== 0) {
    //   //stream.write('\n');
    // }

    const newPercent = Math.ceil(percent * barOptions.width);

    if (lastPercent !== newPercent && shouldUpdate) {
      bar.update(percent, {
        msg,
      });
      lastPercent = newPercent;
    }

    if (!running) {
      running = true;
      // startTime = new Date();
      lastPercent = 0;
    } else if (percent === 1 && compilations[name].running) {
      // const now = new Date();
      // const buildTime = `${(now - startTime) / 1000}s`;

      bar.terminate();

      compilations[name].running = false;
      if (!compilations[name].finished) {
        compilations[name].finished = true;
        compilations[name].postprocessing = 'init';
      }

      running = false;
    }
  });
};

/**
 * This plugin will mute client compilation's progress bar, and will be updating only server ones
 * untill it completes, then it will unmute client and start showing it.
 */
module.exports = (logger: Logger, compilationName: string) => {
  return progressBarPlugin(logger, compilationName);
};

/**
 * We can't get info from webpack, if bundle has done postprocessing, so we need to manually
 * notify progress handler about it.
 */
module.exports.markValid = (compilationName: string) => {
  compilations[compilationName].postprocessing = 'done';
};
