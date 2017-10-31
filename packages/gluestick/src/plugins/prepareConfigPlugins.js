/* @flow */

import type { ConfigPlugin, Plugin, Logger } from '../types';

const readPlugins = require('./readPlugins');
const {
  requireModule,
  requireWithInterop,
  getDefaultExport,
} = require('../utils');
const { createArrowList } = require('../cli/helpers');

type CompilationResults = {
  preOverwrites: {
    [key: string]: Function,
  },
  postOverwrites: {
    [key: string]: Function,
  },
  error?: Error,
};

/**
 * Make necessary assertions and compile plugin.
 */
const compilePlugin = (
  pluginData: Plugin,
  pluginOptions: Object,
): CompilationResults => {
  try {
    if (typeof pluginData.body !== 'function') {
      throw new Error('plugin must export function');
    }

    const pluginBody = pluginData.body(pluginData.options, pluginOptions);
    // Currently config plugin can overwrite only gluestick config, client weback config
    // and server webpack config.
    return {
      preOverwrites: pluginBody.preOverwrites || {},
      postOverwrites: pluginBody.postOverwrites || {},
    };
  } catch (error) {
    // Proivde user-frinedly error message, so the user will know what plugin failed.
    const enchancedError = error;
    enchancedError.message = `${pluginData.name} compilation failed: ${enchancedError.message}`;
    return {
      preOverwrites: {},
      postOverwrites: {},
      error: enchancedError,
    };
  }
};

let pluginsCache = [];

/**
 * Read and compile config plugins. Those plugins are compiled with provided by user
 * `options` object from plugin declaration file, and utilities from gluestick like logger.
 */
module.exports = (
  logger: Logger,
  pluginsConfigPath: string,
): ConfigPlugin[] => {
  if (pluginsCache.length) {
    return pluginsCache;
  }

  const pluginsConfig: Plugin[] = readPlugins(
    logger,
    pluginsConfigPath,
    'config',
  );
  if (!pluginsConfig.length) {
    return [];
  }

  let logMessage: string = 'Compiling config plugins:\n';
  try {
    // Compile plugin, if compilation fails, further compilation is prevented.
    const compiledPlugins: ConfigPlugin[] = pluginsConfig.map(
      (value: Plugin): ConfigPlugin => {
        // Second `compilePlugin` argument is an object with gluestick utilities that
        // will be available for plugins to use.
        const compilationResults: CompilationResults = compilePlugin(value, {
          logger,
          requireModule,
          requireWithInterop,
          getDefaultExport,
        });
        if (compilationResults.error) {
          throw compilationResults.error;
        }

        return {
          name: value.name,
          preOverwrites: compilationResults.preOverwrites,
          postOverwrites: compilationResults.postOverwrites,
          meta: value.meta,
        };
      },
    );

    logMessage += createArrowList(compiledPlugins.map(({ name }) => name), 9);
    logger.info(logMessage);

    pluginsCache = compiledPlugins;
    return compiledPlugins;
  } catch (error) {
    logger.warn(error);
    return [];
  }
};

module.exports.clearCache = () => {
  pluginsCache = [];
};
