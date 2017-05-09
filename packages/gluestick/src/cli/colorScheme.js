/* @flow */

import type { BaseLogger } from '../types';

const chalk = require('chalk');

const success = chalk.bgGreen.black;
const info = chalk.bgCyan.black;
const warn = chalk.bgYellow.black;
const filename = chalk.magenta;
const highlight = chalk.bold;
const debug = chalk.bgWhite.black;
const error = chalk.bgRed.black;

type ColorScheme = BaseLogger & {
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
