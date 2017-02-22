/* @flow */

import type { Plugin, Logger } from '../types';

const path = require('path');

module.exports = (logger: Logger): Plugin[] => {
  try {
    const pluginsRequiredConfig: Object = require(path.join(process.cwd(), 'src/gluestick.plugins.js'));
    const pluginsConfig = pluginsRequiredConfig.default || pluginsRequiredConfig;

    if (!Array.isArray(pluginsConfig)) {
      throw new Error('Invalid plugins configuration: must be an array');
    }

    if (pluginsConfig.length) {
      logger.info('Compiling plugins:');
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

      if (typeof normlizedPlugin.plugin !== 'function') {
        throw new Error(`Plugin ${normlizedPlugin.name} compilation failed`);
      }

      logger.success(`  ${normlizedPlugin.name}`);
      return {
        name: normlizedPlugin.name,
        // $FlowFixMe we check if this is a function above
        body: normlizedPlugin.plugin(normlizedPlugin.options),
      };
    });

    return compiledPlugins;
  } catch (error) {
    console.log(error);
    logger.warn(error);
    return [];
  }
};
