/* @flow */

import type { Plugin, GSConfig } from '../types';

const defaultConfig = require('./defaults/glueStickConfig');

module.exports = exports = (plugins: Plugin[]): GSConfig => {
  if (!Array.isArray(plugins)) {
    throw new Error('Invalid plugins argument');
  }
  const GSConfigOverrides: any = plugins
    .map(plugin => plugin.body.GSConfig)
    .filter(config => !!config)
    .reduce((prev, curr) => {
      return Object.assign(prev, curr);
    }, {});
  return Object.assign({}, defaultConfig, GSConfigOverrides);
};
