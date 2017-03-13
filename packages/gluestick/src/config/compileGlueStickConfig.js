/* @flow */
import type { ConfigPlugin, GSConfig } from '../types';

const clone = require('clone');
const defaultConfig = require('./defaults/glueStickConfig');

module.exports = (plugins: ConfigPlugin[]): GSConfig => {
  if (!Array.isArray(plugins)) {
    throw new Error('Invalid plugins argument');
  }

  return plugins
    .filter((plugin: ConfigPlugin): boolean => !!plugin.postOverwrites.gluestickConfig)
    .map((plugin: ConfigPlugin) => plugin.postOverwrites.gluestickConfig)
    .reduce((prev: GSConfig, curr): GSConfig => {
      // $FlowFixMe curr will be a function
      return curr(clone(prev));
    }, defaultConfig);
};
