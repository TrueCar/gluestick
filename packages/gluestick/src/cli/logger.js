/* @flow */

import type { Logger } from '../types';

const util = require('util');
const clear = require('clear');
const colorScheme = require('./colorScheme');

const levels = {
  success: 20,
  info: 10,
  debug: 0,
  warn: 30,
  error: 40,
};

const verbose = process.env.NODE_ENV === 'production' || process.env.CI || process.env.CD;

const loggerFactory = (type: string, level: string, customTypeText: string = '') => (...args) => {
  if (levels[level] > levels[type]) {
    return;
  }
  const header: string = verbose
    ? `[GlueStick]${process.env.COMMAND ? `[${process.env.COMMAND}]` : ''}`
    : colorScheme[type](`  ${customTypeText.length ? customTypeText : type.toUpperCase()}  `);

  // eslint-disable-next-line no-console
  console.log(
      header,
      ...args.map(arg => typeof arg === 'string' ? arg : util.inspect(arg, { depth: 4 })),
      '\n',
    );
};

const customFactory = level => (type: string, typeText: string, ...args: any[]) => {
  return loggerFactory(type, level, typeText)(...args);
};

const print = (...args) => {
  console.log(...args);
};

module.exports = (level: string): Logger => {
  return {
    clear,
    success: loggerFactory('success', level),
    info: loggerFactory('info', level),
    warn: loggerFactory('warn', level),
    debug: loggerFactory('debug', level),
    error: loggerFactory('error', level),
    fatal: (...args: []): void => {
      loggerFactory('error', 'debug')(...args);
      process.exit(1);
    },
    print,
    level,
    custom: customFactory(level),
    printCommandInfo: () => {
      customFactory(level)('success', 'COMMAND', `gluestick ${process.argv.slice(2).join(' ')}`);
    },
  };
};
