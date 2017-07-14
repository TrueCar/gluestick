/* @flow */

import type { BaseLogger } from '../types';

const chalk = require('chalk');

const success = (...args) =>
  process.env.GS_LOG_LIGHT
    ? chalk.bgGreen.white(...args)
    : chalk.bgGreen.black(...args);
const info = (...args) =>
  process.env.GS_LOG_LIGHT
    ? chalk.bgCyan.white(...args)
    : chalk.bgCyan.black(...args);
const warn = (...args) =>
  process.env.GS_LOG_LIGHT
    ? chalk.bgYellow.white(...args)
    : chalk.bgYellow.black(...args);
const filename = chalk.magenta;
const highlight = chalk.bold;
const debug = (...args) =>
  process.env.GS_LOG_LIGHT
    ? chalk.bgBlack.white(...args)
    : chalk.bgWhite.black(...args);
const error = (...args) =>
  process.env.GS_LOG_LIGHT
    ? chalk.bgRed.white(...args)
    : chalk.bgRed.black(...args);

const compilation = (...args) =>
  process.env.GS_LOG_LIGHT
    ? chalk.bgMagenta.white(...args)
    : chalk.bgMagenta.black(...args);

type ColorScheme = BaseLogger & {
  filename: Function,
  highlight: Function,
  compilation: Function,
};

const colorScheme: ColorScheme = {
  success,
  info,
  warn,
  debug,
  error,
  filename,
  highlight,
  compilation,
};

module.exports = colorScheme;
