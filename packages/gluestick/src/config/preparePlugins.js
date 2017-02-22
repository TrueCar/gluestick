/* @flow */

import type { Plugin, Logger } from '../types';

const path = require('path');

module.exports = (logger: Logger): Plugin[] => {
  try {
    const pluginsRequiredConfig = require(path.join(process.cwd(), 'src/gluestick.plugins.js'));
    const pluginsConfig = pluginsRequiredConfig.default || pluginsRequiredConfig;

    if (!Array.isArray(pluginsConfig)) {
      throw new Error('Invalid plugins configuration');
    }

    const compiledPlugins = pluginsConfig.map((value) => {
      const normlizedPlugin = {
        name: typeof value === 'string' ? value : value.plugin,
        plugin: null,
        options: {},
      };
      normlizedPlugin.plugin = require(
        typeof value === 'string' ? value : value.plugin,
      );
      if (typeof value !== 'string' && Object.keys(value.options).length) {
        normlizedPlugin.options = value.options;
      }
      return {
        name: normlizedPlugin.name,
        body: normlizedPlugin.plugin(normlizedPlugin.options),
      };
    });

    return compiledPlugins;
  } catch (error) {
    logger.warn(error);
    return [];
  }
};
