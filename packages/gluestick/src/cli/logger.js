/* @flow */

import type { Logger } from '../types';

const util = require('util');
const colorScheme = require('./colorScheme');

const loggerFactory = type => (...args) => {
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

const logger: Logger = {
  success: loggerFactory('success'),
  info: loggerFactory('info'),
  warn: loggerFactory('warn'),
  debug: loggerFactory('debug'),
  error: loggerFactory('error'),
};

module.exports = logger;
