/* @flow */

import type { LoggerTypes } from '../types';

const chalk = require('chalk');

const success = chalk.bgGreen.black;
// Here we don't want to set color
// cause of https://github.com/TrueCar/gluestick/issues/624
const info = chalk.bgCyan.black;
const warn = chalk.yellow;
const filename = chalk.cyan;
const highlight = chalk.bold;
const debug = chalk.dim;
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
