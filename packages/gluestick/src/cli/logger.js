/* @flow */

import type { Logger } from '../types';

const colorScheme = require('./colorScheme');

const PREFIX = '[GlueStick]';

const loggerFactory = type => (...args) => {
    // eslint-disable-next-line no-console
  console.log(
      PREFIX,
      ...(type === 'error' ? ['ERROR: '] : []).concat(args.map(arg => colorScheme[type](arg))),
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
