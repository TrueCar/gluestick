/* @flow */
import type { Plugin, GSConfig } from '../types';

const clone = require('clone');
const defaultConfig = require('./defaults/glueStickConfig');

module.exports = (plugins: Plugin[]): GSConfig => {
  if (!Array.isArray(plugins)) {
    throw new Error('Invalid plugins argument');
  }

  return plugins
    .filter((plugin: Plugin): boolean => !!plugin.body.overwriteGluestickConfig)
    .map((plugin: Plugin) => plugin.body.overwriteGluestickConfig)
    .reduce((prev: GSConfig, curr): GSConfig => {
      // $FlowFixMe curr will be a function
      return curr(clone(prev));
    }, defaultConfig);
};
