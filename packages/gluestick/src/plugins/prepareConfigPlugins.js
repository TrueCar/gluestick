/* @flow */

import type { ConfigPlugin, Plugin, Logger } from '../types';

const readPlugins = require('./readPlugins');

type PluginWithStat = ConfigPlugin & {
  error?: Error;
};

const compilePlugin = (pluginData: Plugin, pluginOptions: Object): PluginWithStat => {
  try {
    if (typeof pluginData.plugin !== 'function') {
      throw new Error('plugin must export function');
    }

    const pluginBody = pluginData.plugin(pluginData.options, pluginOptions);

    return {
      name: pluginData.name,
      meta: pluginData.meta,
      overwrites: {
        gluestickConfig: pluginBody.overwriteGluestickConfig,
        clientWebpackConfig: pluginBody.overwriteClientWebpackConfig,
        serverWebpackConfig: pluginBody.overwriteServerWebpackConfig,
      },
    };
  } catch (error) {
    const enchancedError = error;
    enchancedError.message = `${pluginData.name} compilation failed: ${enchancedError.message}`;
    return {
      name: pluginData.name,
      meta: pluginData.meta,
      overwrites: {},
      error: enchancedError,
    };
  }
};

module.exports = (logger: Logger, pluginsConfigPath: string): ConfigPlugin[] => {
  const pluginsConfig: Plugin[] = readPlugins(logger, pluginsConfigPath, 'config');
  if (!pluginsConfig.length) {
    return [];
  }

  logger.info('Compiling config plugins:');
  try {
    const compiledPlugins: ConfigPlugin[] = pluginsConfig.map((value: Plugin): ConfigPlugin => {
      const compilationResults: Object = compilePlugin(value, { logger });
      if (compilationResults.error) {
        throw compilationResults.error;
      }
      logger.success(`  ${value.name} compiled successfully`);
      return {
        name: value.name,
        overwrites: compilationResults.overwrites,
        meta: compilationResults.meta,
      };
    });

    return compiledPlugins;
  } catch (error) {
    logger.warn(error);
    return [];
  }
};
