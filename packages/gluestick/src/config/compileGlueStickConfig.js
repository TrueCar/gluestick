/* @flow */
import type { Plugin, GSConfig } from '../types';

const clone = require('clone');
const defaultConfig = require('./defaults/glueStickConfig');

module.exports = (plugins: Plugin[]): GSConfig => {
  if (!Array.isArray(plugins)) {
    throw new Error('Invalid plugins argument');
  }

  const GSConfigOverrides: any = plugins
    .filter((plugin: Plugin): boolean => !!plugin.body.overwriteGluestickConfig)
    .map((plugin: Plugin) => plugin.body.overwriteGluestickConfig)
    .reduce((prev: Object, curr): Object => {
      // $FlowFixMe curr will be a function
      return Object.assign(prev, curr(clone(defaultConfig)));
    }, {});
  return Object.assign({}, defaultConfig, GSConfigOverrides);
};
