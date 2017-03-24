/* @flow */

import type { Logger, GSConfig } from '../types';

const util = require('util');

// Read config from command line arguments.
const config: GSConfig = JSON.parse(process.argv[2] || '{}');

// Prepare logger.
const loggerFactory = (type: string): (values: Array<*>) => void => {
  if (process.env.NODE_ENV === 'production') {
    return (...values) => {
      const log = `${type.toUpperCase()}: ${
        values.reduce((prev, curr) => {
          return prev.concat(typeof curr === 'string' ? curr : util.inspect(curr, { depth: 4 }));
        }, '')
      }`;
      if (type === 'error') {
        process.stderr.write(log);
      } else {
        process.stdout.write(log);
      }
    };
  }
  return (...values) => {
    const stringfiedValues = JSON.stringify(values, (key: string, value: any) => {
      return typeof value === 'function' ? `[Function: ${value.name}]` : value;
    });
    // $FlowFixMe
    process.send({ type, value: stringfiedValues });
  };
};
const logger: Logger = {
  info: loggerFactory('info'),
  success: loggerFactory('success'),
  error: loggerFactory('error'),
  warn: loggerFactory('warn'),
  debug: loggerFactory('debug'),
};

// Exec renderer server.
require('babel-polyfill');
require('./main')({ config, logger });
