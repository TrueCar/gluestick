/* @flow */

import type { Logger } from '../../types';

const chalk = require('chalk');
const webpack = require('webpack');
const ProgressBar = require('progress');

/**
 * Compilation states
 * `status` and `postprocessing` can have the folliwing values:
 * - init (it means it was initialised, but haven't started)
 * - running
 * - done
 */
const compilations = {
  server: {
    muted: false,
    status: 'init',
    postprocessing: '',
  },
  client: {
    muted: false,
    status: 'init',
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
type Options = {
  pretty?: boolean;
  barOptions?: Object;
}
const progressBarPlugin = (logger: Logger, name: string, options: Options = {}) => {
  const stream: any = options.stream || process.stderr;
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
    // This function is first called when compilation is actually happening, so
    // if the current compilation is initialised, change it's status to running.
    if (compilations[name].status === 'init') {
      compilations[name].status = 'running';
    }

    // If compilation is finished on server, start-server will start postprocessing
    // so log appropriate message unless start-client is running. In that case don't log
    // the message, as it will break client's progress bar.
    if (
      name === 'server'
      && compilations[name].status === 'done'
      && compilations[name].postprocessing === 'init'
      && compilations.client.status === 'init'
    ) {
      compilations[name].postprocessing = 'running';
      stream.write(
        `${header} Postprocessing...`,
      );
    }

    // If compilation is finished and done postprocessing, it means it's in rebuild state.
    if (compilations[name].status === 'done' && compilations[name].postprocessing === 'done') {
      if (msg === 'compiling') {
        stream.cursorTo(0);
        stream.write(`${header} Rebuilding...`);
      } else if (msg === 'emitting') {
        stream.clearLine();
        stream.cursorTo(0);
        logger.info(`${name[0].toUpperCase()}${name.slice(1)} bundle rebuilt`);
      }
    }

    // If current compilation is server and is running, mute the client's one.
    // If current compilation is client and server is not running, unmute itself.
    if (name === 'server' && compilations[name].status === 'running') {
      compilations.client.muted = true;
    } else if (name === 'client' && compilations.server.status !== 'running') {
      compilations.client.muted = false;
    }

    const shouldUpdate = !compilations[name].muted && compilations[name].status === 'running';
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
    } else if (percent === 1 && compilations[name].status === 'running') {
      // const now = new Date();
      // const buildTime = `${(now - startTime) / 1000}s`;

      bar.terminate();

      // If compilation is finished, set postprocessing to `init`, so server can print
      // appropriate message.
      compilations[name].status = 'done';
      compilations[name].postprocessing = 'init';

      running = false;
    }
  });
};

/**
 * This plugin will mute client compilation's progress bar, and will be updating only server ones
 * untill it completes, then it will unmute client and start showing it.
 */
module.exports = progressBarPlugin;

/**
 * We can't get info from webpack, if bundle has done postprocessing, so we need to manually
 * notify progress handler about it.
 */
module.exports.markValid = (compilationName: string) => {
  compilations[compilationName].postprocessing = 'done';
};
