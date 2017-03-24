/* @flow */

import type { LoggerTypes } from '../types';

const chalk = require('chalk');

const success = chalk.green;
// Here we don't want to set color
// cause of https://github.com/TrueCar/gluestick/issues/624
const info = (msg) => msg;
const warn = chalk.yellow;
const filename = chalk.cyan;
const highlight = chalk.bold;
const debug = chalk.dim;
const error = chalk.red;

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
