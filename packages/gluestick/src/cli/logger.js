/* @flow */

import type { Logger } from '../types';

const util = require('util');
const clear = require('clear');
const readline = require('readline');
const colorScheme = require('./colorScheme');

const levels = {
  success: 20,
  info: 10,
  debug: 0,
  warn: 30,
  error: 40,
};

// If you need to find what module prints directly to console.log, uncomment this code
// and replace `Put some text here` with some word from log you're interested in
// console._log = console.log.bind(console);
// console.log = (...args) => {
//   console._log(...args);
//   if (args[0].includes('Put some text here')) {
//     console.trace('here');
//   }
// };

const raw =
  (process.env.NODE_ENV === 'production' || process.env.CI || process.env.CD) &&
  !process.env.GS_LOG_PRETTY;

const logMessage = ({ type, level, title }, ...args: any[]) => {
  if (levels[level] > levels[type]) {
    return;
  }

  const enhancer: Function = colorScheme[type];

  const header: string = raw
    ? `[GlueStick][${process.argv[2]}][${title.length
        ? title
        : type.toUpperCase()}]`
    : enhancer(`  ${title.length ? title : type.toUpperCase()}  `);

  console.log(
    header,
    ...args.map(
      arg => (typeof arg === 'string' ? arg : util.inspect(arg, { depth: 4 })),
    ),
    raw ? '' : '\n',
  );
};

const loggerFactory = (type: string, level: string, title: string = '') => (
  ...args
) => {
  logMessage({ type, level, title }, ...args);
};

const print = (...args) => {
  console.log(...args);
};

module.exports = (level: string): Logger => {
  return {
    pretty: !raw,
    level,
    // Clears screen
    clear: raw ? () => {} : clear,
    // Log custom message
    log: (type: string, title: string, ...args: any[]): void => {
      logMessage({ type, title, level }, ...args);
    },
    success: loggerFactory('success', level),
    info: loggerFactory('info', level),
    warn: loggerFactory('warn', level),
    debug: loggerFactory('debug', level),
    error: loggerFactory('error', level),
    // Same as error but kills process after logging message
    fatal: (...args: any[]): void => {
      logMessage({ type: 'error', title: '', level }, ...args);
      process.exit(1);
    },
    // Log message without any color enhancement
    print,
    // Log command info message
    printCommandInfo: () => {
      logMessage(
        { type: 'success', title: 'COMMAND', level },
        `gluestick ${process.argv.slice(2).join(' ')}`,
      );
    },
    resetLine: raw
      ? () => {}
      : () => {
          readline.clearLine(process.stdout, 0);
          readline.cursorTo(process.stdout, 0);
        },
  };
};

module.exports.levels = levels;
