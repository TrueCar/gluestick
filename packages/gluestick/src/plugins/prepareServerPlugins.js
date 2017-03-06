/* @flow */

import type { ServerPlugin, Plugin, Logger } from '../types';

type CopilationResults = {
  [key: string]: Function | Object;
  error?: Error;
};

type PluginRef = {
  ref: Function;
  options?: Object;
}

/**
 * Compile plugin.
 */
const compilePlugin = (pluginSpec: Plugin, pluginOptions: Object): CopilationResults => {
  try {
    const pluginBody = pluginSpec.body(pluginSpec.options, pluginOptions);

    // Currently server plugin can overwrite renderMethod and provide hooks.
    return {
      renderMethod: pluginBody.renderMethod,
      hooks: pluginBody.hooks,
    };
  } catch (error) {
    // Proivde user-frinedly error message, so the user will know what plugin failed.
    const enchancedError = error;
    enchancedError.message = `${pluginSpec.name} compilation failed: ${enchancedError.message}`;
    return {
      renderMethod: () => {},
      hooks: {},
      error: enchancedError,
    };
  }
};

/**
 * Compile server plugins from given array. Those plugins are compiled with provided by user
 * `options` object from plugin declaration file, and utilities from gluestick like logger.
 */
module.exports = (logger: Logger, plugins: PluginRef[]): ServerPlugin[] => {
  try {
    // Get server plugins only and perform necessry checks.
    const filteredPlugins = plugins.filter(
      (plugin: PluginRef, index: number): boolean => {
        if (typeof plugin.ref !== 'function') {
          throw new Error(`Plugin at position ${index} must export a function`);
        }
        if (!plugin.ref.meta) {
          throw new Error(`Plugin at position ${index} must export meta object`);
        }
        return plugin.ref.meta.type === 'server';
      },
    );

    if (!filteredPlugins.length) {
      return [];
    }

    logger.info('Compiling server plugins:');
    // Compile plugin, if compilation fails, further compilation is prevented.
    const compiledPlugins: ServerPlugin[] = filteredPlugins.map(
      (value: PluginRef): ServerPlugin => {
        const normalizedPlugin: Plugin = {
          name: value.ref.meta.name || value.ref.name || 'unknown',
          meta: value.ref.meta,
          body: value.ref,
          options: value.options || {},
        };

        // Second `compilePlugin` argument is an object with gluestick utilities that
        // will be available for plugins to use.
        const compilationResults: Object = compilePlugin(normalizedPlugin, { logger });
        if (compilationResults.error) {
          throw compilationResults.error;
        }
        logger.success(`  ${normalizedPlugin.name} compiled successfully`);
        return {
          name: normalizedPlugin.name,
          meta: normalizedPlugin.meta,
          renderMethod: compilationResults.renderMethod,
          hooks: compilationResults.hooks,
        };
      },
    );
    return compiledPlugins;
  } catch (error) {
    logger.warn(error);
    return [];
  }
};
