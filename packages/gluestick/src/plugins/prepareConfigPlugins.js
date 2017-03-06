/* @flow */

import type { ConfigPlugin, Plugin, Logger } from '../types';

const readPlugins = require('./readPlugins');

type CompilationResults = {
  overwrites: {
    [key: string]: Function;
  };
  error?: Error;
};

/**
 * Make necessary assertions and compile plugin.
 */
const compilePlugin = (pluginData: Plugin, pluginOptions: Object): CompilationResults => {
  try {
    if (typeof pluginData.body !== 'function') {
      throw new Error('plugin must export function');
    }

    const pluginBody = pluginData.body(pluginData.options, pluginOptions);

    // Currently config plugin can overwrite only gluestick config, client weback config
    // and server webpack config.
    return {
      overwrites: {
        gluestickConfig: pluginBody.overwriteGluestickConfig,
        clientWebpackConfig: pluginBody.overwriteClientWebpackConfig,
        serverWebpackConfig: pluginBody.overwriteServerWebpackConfig,
      },
    };
  } catch (error) {
    // Proivde user-frinedly error message, so the user will know what plugin failed.
    const enchancedError = error;
    enchancedError.message = `${pluginData.name} compilation failed: ${enchancedError.message}`;
    return {
      overwrites: {},
      error: enchancedError,
    };
  }
};

/**
 * Read and compile config plugins. Those plugins are compiled with provided by user
 * `options` object from plugin declaration file, and utilities from gluestick like logger.
 */
module.exports = (logger: Logger, pluginsConfigPath: string): ConfigPlugin[] => {
  const pluginsConfig: Plugin[] = readPlugins(logger, pluginsConfigPath, 'config');

  if (!pluginsConfig.length) {
    return [];
  }

  logger.info('Compiling config plugins:');
  try {
    // Compile plugin, if compilation fails, further compilation is prevented.
    const compiledPlugins: ConfigPlugin[] = pluginsConfig.map((value: Plugin): ConfigPlugin => {
      // Second `compilePlugin` argument is an object with gluestick utilities that
      // will be available for plugins to use.
      const compilationResults: CompilationResults = compilePlugin(value, { logger });
      if (compilationResults.error) {
        throw compilationResults.error;
      }
      logger.success(`  ${value.name} compiled successfully`);
      return {
        name: value.name,
        overwrites: compilationResults.overwrites,
        meta: value.meta,
      };
    });

    return compiledPlugins;
  } catch (error) {
    logger.warn(error);
    return [];
  }
};
