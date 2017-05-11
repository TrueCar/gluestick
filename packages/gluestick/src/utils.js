/* @flow */

import type { Logger } from './types';

const fs = require('fs');
const path = require('path');
const Table = require('cli-table');
const chalk = require('chalk');

const convertToCamelCase =
  (value: string): string => `${
    value[0].toLowerCase()
  }${
    value.substr(1).replace(/(-\w)/g, match => match[1].toUpperCase())
  }`;

const convertToKebabCase = (value: string): string => {
  const parsedValue = value.replace(/([A-Z])/g, match => `-${match[0].toLowerCase()}`);
  return parsedValue[0] === '-' ? parsedValue.substring(1) : parsedValue;
};

const convertToPascalCase = (value: string): string => `${
  value[0].toUpperCase()
}${
  convertToCamelCase(value.slice(1))
}`;

const convertToCamelCaseWithPrefix = (prefix: string, value: string): string => {
  return `${
    convertToCamelCase(prefix)
  }${
    convertToPascalCase(value)
  }`;
};

const isValidEntryPoint = (entryPoint: string, logger: Logger) => {
  if (!/^(shared|apps\/.+)$/.test(entryPoint)) {
    logger.error(`${entryPoint} is not a valid entry point`);
    logger.info('Pass -E and a valid entry point: \'shared\' or \'apps/{validAppName}\'');
    return false;
  }
  const entryPath = path.join('src', entryPoint);
  if (!fs.existsSync(entryPath)) {
    logger.error(`Path ${entryPath} does not exist`);
    return false;
  }
  return true;
};

const throttle = (fn: Function, threshold: number = 250): Function => {
  let last;
  let deferTimer;
  return (...args) => {
    const now = +new Date();
    if (last && now < last + threshold) {
      clearTimeout(deferTimer);
      deferTimer = setTimeout(() => {
        last = now;
        fn(...args);
      }, threshold);
    } else {
      last = now;
      fn(...args);
    }
  };
};

const printWebpackStats = (logger: Logger, stats: Object) => {
  const compilationStats = stats.toJson({
    assets: true,
  });

  const table = new Table({
    head: ['Asset', 'Size'],
    colWidths: [50, 12],
    chars: {
      top: '═',
      'top-mid': '╤',
      'top-left': '╔',
      'top-right': '╗',
      bottom: '═',
      'bottom-mid': '╧',
      'bottom-left': '╚',
      'bottom-right': '╝',
      left: '║',
      'left-mid': '╟',
      mid: '─',
      'mid-mid': '┼',
      right: '║',
      'right-mid': '╢',
      middle: '│',
    },
    style: {
      head: ['green'],
    },
  });

  const formatSize = size => {
    if (size < 1024) {
      return `${size} B`;
    }
    const kb = size / 1024;
    return kb > 1024 ? chalk.yellow(`${(kb / 1024).toFixed(2)} MB`) : `${kb.toFixed(2)} KB`;
  };

  table.push(
    ...compilationStats.assets.map(({ name, size }) => [name, formatSize(size)]),
  );

  logger.print(table.toString(), '\n');
};

module.exports = {
  isValidEntryPoint,
  convertToCamelCase,
  convertToKebabCase,
  convertToPascalCase,
  convertToCamelCaseWithPrefix,
  throttle,
  printWebpackStats,
};
