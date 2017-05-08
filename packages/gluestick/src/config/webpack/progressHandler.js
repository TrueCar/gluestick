/* @flow */

const chalk = require('chalk');
const webpack = require('webpack');
const ProgressBar = require('progress');

const compilations = {
  server: {
    muted: false,
    running: false,
  },
  client: {
    muted: false,
    running: false,
  },
};

// For documentation go here https://github.com/clessg/progress-bar-webpack-plugin
// The code for ProgressBarPlugin is almost identical to the one from the link,
// except for mutin/unmuting code, which was impossible to add using progress-bar-webpack-plugin
// directy.
const ProgressBarPlugin = (name, options = {}) => {
  const stream = options.stream || process.stderr;
  // $FlowIgnore
  const enabled = stream && stream.isTTY;

  if (!enabled) {
    return () => {};
  }

  const barLeft = chalk.bold('[');
  const barRight = chalk.bold(']');
  const preamble = chalk.cyan.bold('  build ') + barLeft;
  const barFormat = options.format || `${preamble}:bar${barRight}${chalk.green.bold(' :percent')}`;
  const customSummary = options.customSummary;

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
  let startTime = 0;
  let lastPercent = 0;

  return new webpack.ProgressPlugin((percent, msg) => {
    // Mark current compilation as running
    if (!compilations[name].running) {
      compilations[name].running = true;
    }

    // If current compilation is server and is running, mute the client's one
    // If current compilation is client and server is not running, unmute itself
    if (name === 'server' && compilations[name].running) {
      compilations.client.muted = true;
    } else if (name === 'client' && !compilations.server.running) {
      compilations.client.muted = false;
    }

    const shouldUpdate = !compilations[name].muted;

    if (!running && lastPercent !== 0 && !customSummary) {
      stream.write('\n');
    }

    const newPercent = Math.ceil(percent * barOptions.width);


    if (lastPercent !== newPercent && shouldUpdate) {
      bar.update(percent, {
        msg,
      });
      lastPercent = newPercent;
    }

    if (!running) {
      running = true;
      startTime = new Date();
      lastPercent = 0;
    } else if (percent === 1) {
      const now = new Date();
      const buildTime = `${(now - startTime) / 1000}s`;

      bar.terminate();

      compilations[name].running = false;

      if (customSummary) {
        customSummary(buildTime);
      }

      running = false;
    }
  });
};

/**
 * This plugin will mute client compilation's progress bar, and will be updating only server ones
 * untill it completes, then it will unmute client and start showing it.
 */
module.exports = (compilationName: string) => new ProgressBarPlugin(compilationName, {
  format: `${
    chalk.bgMagenta.black(`  COMPILATION:${compilationName.toUpperCase()}  `)
  } [:bar] ${chalk.green.bold(':percent')} (:elapsed seconds)`,
  customSummary: () => {},
});
