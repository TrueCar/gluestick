/* @flow */

const pathToRegexp = require('path-to-regexp');

type PathRegexp = RegExp & {
  fromRegex?: boolean,
  keys?: string[],
};

module.exports = function parseRoutePath(routePath: string): PathRegexp {
  const match = /\/(.+)\/([gmiyu]*)$/.exec(routePath);
  if (match) {
    const [, pattern, modifiers] = match;
    const results = new RegExp(pattern, modifiers);
    // $FlowIgnore
    results.fromRegex = true;
    return results;
  }

  const keys = [];
  const results = pathToRegexp(routePath, keys, { end: false });
  results.keys = keys;
  return results;
};
