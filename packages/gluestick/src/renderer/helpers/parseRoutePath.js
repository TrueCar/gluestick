const pathToRegexp = require('path-to-regexp');

module.exports = function parseRoutePath(routePath) {
  const match = /\/(.+)\/([gmiyu]*)$/.exec(routePath);
  if (match) {
    const [, pattern, modifiers] = match;
    const results = new RegExp(pattern, modifiers);
    results.fromRegex = true;
    return results;
  }

  const keys = [];
  const results = pathToRegexp(routePath, keys);
  results.keys = keys;
  return results;
};
