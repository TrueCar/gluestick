/* @flow */

import type { Logger } from '../types';

const util = require('util');
const colorScheme = require('./colorScheme');

const levels = {
  success: 20,
  info: 10,
  debug: 0,
  warn: 30,
  error: 40,
};

const loggerFactory = (type: string, level: string) => (...args) => {
  if (levels[level] > levels[type]) {
    return;
  }
  // eslint-disable-next-line no-console
  console.log(
      `[GlueStick]${process.env.COMMAND ? `[${process.env.COMMAND}]` : ''}`,
      ...(type === 'error' ? ['ERROR: '] : []).concat(
        args.map(arg => colorScheme[type](
          typeof arg === 'string' ? arg : util.inspect(arg, { depth: 4 }),
        )),
      ),
    );
};

module.exports = (level: string = 'info'): Logger => {
  return {
    success: loggerFactory('success', level),
    info: loggerFactory('info', level),
    warn: loggerFactory('warn', level),
    debug: loggerFactory('debug', level),
    error: loggerFactory('error', level),
  };
};
