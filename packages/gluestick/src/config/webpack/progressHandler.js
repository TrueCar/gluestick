/* @flow */

import type { Logger } from '../../types';

const chalk = require('chalk');
const webpack = require('webpack');
const ProgressBar = require('progress');
const { throttle } = require('../../utils');

const compilations = {
  server: {
    muted: false,
    running: false,
    finished: false,
    postprocessing: false,
  },
  client: {
    muted: false,
    running: false,
    finished: false,
  },
};

// For documentation go here https://github.com/clessg/progress-bar-webpack-plugin
// The code for ProgressBarPlugin is almost identical to the one from the link,
// except for mutin/unmuting code, which was impossible to add using progress-bar-webpack-plugin
// directy.
const ProgressBarPlugin = (logger: Logger, name: string, options = {}) => {
  const stream = options.stream || process.stderr;
  const enabled = stream && stream.isTTY;

  if (!enabled) {
    return () => {};
  }

  const barFormat = `${
    chalk.bgMagenta.black(`  COMPILATION:${name.toUpperCase()}  `)
  } [:bar] ${chalk.green.bold(':percent')} (:elapsed seconds)`;

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
    // console._log(msg);
    // Mark current compilation as running
    if (!compilations[name].running) {
      compilations[name].running = true;
    }

    // If compilation is finished on server, start-server will start postprocessing
    // so log appropriate message
    if (compilations[name].finished && !compilations[name].postprocessing && name === 'server') {
      compilations[name].postprocessing = true;
      // logger.print(
      //   `${chalk.bgMagenta.black(`  COMPILATION:${name.toUpperCase()}  `)} Postprocessing`,
      // );
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
    } else if (percent === 1) {
      // const now = new Date();
      // const buildTime = `${(now - startTime) / 1000}s`;

      bar.terminate();

      compilations[name].running = false;
      if (!compilations[name].finished) {
        compilations[name].finished = true;
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
  return new ProgressBarPlugin(logger, compilationName);
};
