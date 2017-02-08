/* @flow */

import type { LoggerTypes } from '../types';

const chalk = require('chalk');

const success = chalk.green;
const info = chalk.yellow;
const warn = chalk.red;
const filename = chalk.cyan;
const highlight = chalk.bold;
const debug = chalk.blue;
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
