const path = require('path');
const cache = {};

module.exports = (parent, child) => {
  const childWithoutQuery = child.split('?')[0];
  const key = `${parent}-${childWithoutQuery}`;
  const cacheResult = cache[key];

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
