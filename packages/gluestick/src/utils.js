/* @flow */

import type { Logger } from './types';

const fs = require('fs');
const path = require('path');

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

module.exports = {
  isValidEntryPoint,
  convertToCamelCase,
  convertToKebabCase,
  convertToPascalCase,
  convertToCamelCaseWithPrefix,
  throttle,
};
