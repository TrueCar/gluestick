/* @flow */

import type { Logger } from '../types';

const util = require('util');
const clear = require('clear');
const colorScheme = require('./colorScheme');

const _log = console.log.bind(process);
// $FlowIgnore add original log method for easier debuging
console._log = _log;

// Webpack doesn't allow to use custom logger/reporter so console.log needs to surpressed
// $FlowIgnore
console.log = () => {};

const levels = {
  success: 20,
  info: 10,
  debug: 0,
  warn: 30,
  error: 40,
};

const verbose = process.env.NODE_ENV === 'production' || process.env.CI || process.env.CD;

const logMessage = ({ type, level, title }, ...args: any[]) => {
  if (levels[level] > levels[type]) {
    return;
  }

  const enhancer: Function = colorScheme[type];

  const header: string = verbose
    ? `[GlueStick]${process.env.COMMAND ? `[${process.env.COMMAND}]` : ''}`
    : enhancer(`  ${title.length ? title : type.toUpperCase()}  `);

  _log(
      header,
      ...args.map(arg => typeof arg === 'string' ? arg : util.inspect(arg, { depth: 4 })),
      '\n',
    );
};

const loggerFactory = (type: string, level: string, title: string = '') => (...args) => {
  logMessage({ type, level, title }, ...args);
};

const print = (...args) => {
  _log(...args);
};

module.exports = (level: string): Logger => {
  return {
    level,
    clear,
    log: (type: string, title: string, ...args: any[]): void => {
      logMessage({ type, title, level }, ...args);
    },
    success: loggerFactory('success', level),
    info: loggerFactory('info', level),
    warn: loggerFactory('warn', level),
    debug: loggerFactory('debug', level),
    error: loggerFactory('error', level),
    fatal: (...args: any[]): void => {
      logMessage({ type: 'error', title: 'error', level }, ...args);
      process.exit(1);
    },
    print,
    printCommandInfo: () => {
      logMessage(
        { type: 'success', title: 'COMMAND', level },
        `gluestick ${process.argv.slice(2).join(' ')}`,
      );
    },
  };
};
