/* @flow */

import type { Plugin, Logger } from '../types';

const pluginsFilter = require('../lib/pluginsFilter');

type PluginWithStat = Plugin & {
  error?: Error;
};

const getPluginsConfig = (logger: Logger, pluginsConfigPath: string): Object[] => {
  try {
    const pluginsRequiredConfig: Object = require(pluginsConfigPath);
    const pluginsConfig: Object = pluginsRequiredConfig.default || pluginsRequiredConfig;

    if (!Array.isArray(pluginsConfig)) {
      throw new Error('Invalid plugins configuration: must be an array');
    }

    if (pluginsConfig.length) {
      logger.info('Compiling plugins:');
    }
    return pluginsFilter(pluginsConfig, 'rootWrapper', true);
  } catch (error) {
    logger.warn(error);
    return [];
  }
};

const compilePlugin = (pluginConfig: Object, pluginOptions: Object): PluginWithStat => {
  const name: string = typeof pluginConfig === 'string' ? pluginConfig : pluginConfig.plugin;
  try {
    const normlizedPlugin = {
      plugin: null,
      options: {},
    };

    normlizedPlugin.plugin = require(name);
    if (typeof pluginConfig !== 'string' && pluginConfig.options) {
      normlizedPlugin.options = pluginConfig.options;
    }

    if (typeof normlizedPlugin.plugin !== 'function') {
      throw new Error('plugin must export function');
    }

    const pluginBody = normlizedPlugin.plugin(normlizedPlugin.options, pluginOptions);

    return {
      name,
      body: pluginBody,
    };
  } catch (error) {
    const enchancedError = error;
    enchancedError.message = `${name} compilation failed: ${enchancedError.message}`;
    return {
      name,
      body: {},
      error: enchancedError,
    };
  }
};

module.exports = (logger: Logger, pluginsConfigPath: string): Plugin[] => {
  const pluginsConfig = getPluginsConfig(logger, pluginsConfigPath);
  if (!pluginsConfig.length) {
    return [];
  }

  try {
    const compiledPlugins: Plugin[] = pluginsConfig.map((value: Object): Plugin => {
      const compilationResults: PluginWithStat = compilePlugin(value, { logger });
      if (compilationResults.error) {
        throw compilationResults.error;
      }
      logger.success(`  ${compilationResults.name} compiled successfully`);
      return {
        name: compilationResults.name,
        body: compilationResults.body,
      };
    });

    return compiledPlugins;
  } catch (error) {
    logger.warn(error);
    return [];
  }
};
