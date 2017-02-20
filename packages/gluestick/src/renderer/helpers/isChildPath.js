/* @flow */

const path = require('path');

const cache: { [key: string]: boolean } = {};

module.exports = (parent: string, child: string): boolean => {
  const childWithoutQuery: string = child.split('?')[0];
  const key: string = `${parent}-${childWithoutQuery}`;
  const cacheResult: boolean = cache[key];

  if (cacheResult) {
    return cacheResult;
  }

  if (parent === '/') {
    cache[key] = true;
    return cache[key];
  }

  cache[key] = path.relative(parent, child).substr(0, 1) !== '.';
  return cache[key];
};
