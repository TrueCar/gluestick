/* @flow */
import type { ServerPlugin, Plugin } from '../types';
import logger from '../logger';

const plugins = require('project-entries').plugins;

const { createArrowList } = require('../cli/helpers');
const { requireModule } = require('../utils');

type CompilationResults = {
  [key: string]: Function | Object,
  error?: Error,
};

type PluginRef = {
  ref: Function,
  type: string,
  options?: Object,
};

/**
 * Compile plugin.
 */
const compilePlugin = (
  pluginSpec: Plugin,
  pluginOptions: Object,
): CompilationResults => {
  try {
    const pluginBody = pluginSpec.body
      ? pluginSpec.body(pluginSpec.options, pluginOptions)
      : {};

    // Currently server plugin can overwrite renderMethod and provide hooks and logger.
    return {
      renderMethod: pluginBody.renderMethod,
      hooks: pluginBody.hooks,
      logger: pluginBody.logger,
    };
  } catch (error) {
    // Proivde user-frinedly error message, so the user will know what plugin failed.
    const enchancedError = error;
    enchancedError.message = `${pluginSpec.name} compilation failed: ${enchancedError.message}`;
    return {
      renderMethod: () => {},
      hooks: {},
      logger: {},
      error: enchancedError,
    };
  }
};

/**
 * Compile server plugins from given array. Those plugins are compiled with provided by user
 * `options` object from plugin declaration file, and utilities from gluestick like logger.
 */
const prepareServerPlugins = (): ServerPlugin[] => {
  try {
    // Get server plugins only and perform necessry checks.
    const filteredPlugins = plugins.filter(
      (plugin: PluginRef, index: number): boolean => {
        if (
          typeof plugin.ref !== 'function' &&
          typeof plugin.ref.plugin !== 'function'
        ) {
          throw new Error(`Plugin at position ${index} must export a function`);
        }
        return plugin.type === 'server';
      },
    );
    if (!filteredPlugins.length) {
      return [];
    }

    let logMessage: string = 'Compiling server plugins:\n';
    // Compile plugin, if compilation fails, further compilation is prevented.
    const compiledPlugins: ServerPlugin[] = filteredPlugins.map(
      (value: PluginRef): ServerPlugin => {
        const normalizedPlugin: Plugin = {
          name: value.ref.meta
            ? value.ref.meta.name
            : value.ref.name || 'unknown',
          meta: value.ref.meta || {},
          body: value.ref,
          options: value.options || {},
        };
        // Second `compilePlugin` argument is an object with gluestick utilities that
        // will be available for plugins to use.
        const compilationResults: Object = compilePlugin(normalizedPlugin, {
          logger,
          requireModule,
        });
        if (compilationResults.error) {
          throw compilationResults.error;
        }

        return {
          name: normalizedPlugin.name,
          meta: normalizedPlugin.meta,
          renderMethod: compilationResults.renderMethod,
          hooks: compilationResults.hooks,
          logger: compilationResults.logger,
        };
      },
    );

    logMessage += createArrowList(compiledPlugins.map(({ name }) => name), 9);
    logger.info(logMessage);

    return compiledPlugins;
  } catch (error) {
    logger.warn(error);
    return [];
  }
};

module.exports = prepareServerPlugins();
