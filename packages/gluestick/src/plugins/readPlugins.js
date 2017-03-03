/* @flow */
import type { Plugin, Logger } from '../types';

const { requireWithInterop } = require('../lib/utils');

/**
 * Require plugin declaration file, ensue schema is valid and return normalized Plugin object.
 */
module.exports = (logger: Logger, pluginsConfigPath: string, pluginType: string): Plugin[] => {
  try {
    // Plugin declaration file can be ESM or CommonJS.
    const pluginsDeclaration: any[] = requireWithInterop(pluginsConfigPath);

    if (!Array.isArray(pluginsDeclaration)) {
      throw new Error('Invalid plugins configuration: must be an array');
    }

    // Check if every element in plugins array matches schema.
    // It can be string or object with `plugin` filed set to plugin name.
    pluginsDeclaration.forEach((pluginDeclaration: any): void => {
      if (
        !pluginDeclaration
        || (typeof pluginDeclaration !== 'string' && typeof pluginDeclaration !== 'object')
        || (typeof pluginDeclaration === 'object' && !pluginDeclaration.plugin)
      ) {
        throw new Error(`Invalid plugin declaration element: ${JSON.stringify(pluginDeclaration)}`);
      }
    });

    // Normalize each plugin to common format.
    // Then filter for plugins matching type meta property.
    return pluginsDeclaration.map((pluginDeclaration: any): Plugin => {
      const name = typeof pluginDeclaration === 'string'
        ? pluginDeclaration
        : pluginDeclaration.plugin;
      const body = requireWithInterop(name);
      return {
        name,
        plugin: body,
        meta: body.meta,
        options: typeof pluginDeclaration === 'string' ? {} : pluginDeclaration.options || {},
      };
    }).filter((pluginData: Plugin): boolean => {
      return pluginData.meta.type === pluginType;
    });
  } catch (error) {
    logger.error(error);
    return [];
  }
};
