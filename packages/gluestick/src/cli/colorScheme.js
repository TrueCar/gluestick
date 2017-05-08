/* @flow */

import type { LoggerTypes } from '../types';

const chalk = require('chalk');

const success = chalk.bgGreen.black;
const info = chalk.bgCyan.black;
const warn = chalk.bgYellow.black;
const filename = chalk.magenta;
const highlight = chalk.bold;
const debug = chalk.bgWhite.back;
const error = chalk.bgRed.black;

type ColorScheme = LoggerTypes & {
  filename: Function;
  highlight: Function;
}

const colorScheme: ColorScheme = {
  success,
  info,
  warn,
  debug,
  error,
  filename,
  highlight,
};

module.exports = colorScheme;
