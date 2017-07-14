/* @flow */
import type { Plugin, BaseLogger } from '../types';

const { requireModule, requireWithInterop } = require('../utils');

/**
 * Require plugin declaration file, ensue schema is valid and return normalized Plugin object.
 */
module.exports = (
  logger: BaseLogger,
  pluginsConfigPath: string,
  pluginType: string,
): Plugin[] => {
  try {
    // Plugin declaration file can be ESM or CommonJS.
    const pluginsDeclaration: any[] = requireModule(pluginsConfigPath);

    if (!Array.isArray(pluginsDeclaration)) {
      throw new Error('Invalid plugins configuration: must be an array');
    }

    // Check if every element in plugins array matches schema.
    // It can be string or object with `plugin` filed set to plugin name.
    pluginsDeclaration.forEach((pluginDeclaration: any): void => {
      if (
        !pluginDeclaration ||
        (typeof pluginDeclaration !== 'string' &&
          typeof pluginDeclaration !== 'object') ||
        (typeof pluginDeclaration === 'object' && !pluginDeclaration.plugin)
      ) {
        throw new Error(
          `Invalid plugin declaration element: ${JSON.stringify(
            pluginDeclaration,
          )}`,
        );
      }
    });

    // Normalize each plugin to common format.
    // Then filter for plugins matching type meta property.
    return pluginsDeclaration
      .map((pluginDeclaration: any): Plugin => {
        const name =
          typeof pluginDeclaration === 'string'
            ? pluginDeclaration
            : pluginDeclaration.plugin;

        // Try to read plugin source. If it doesn't exists, it will be filtered from list.
        let body = null;
        try {
          body = requireWithInterop(`${name}/build/${pluginType}.js`);
        } catch (error) {
          // NOOP it is possible that give file does not exists and it's
          // perfectly fine.
        }

        return {
          name,
          body,
          meta: body ? { ...body.meta, type: pluginType } : {},
          options:
            typeof pluginDeclaration === 'string'
              ? {}
              : pluginDeclaration.options || {},
        };
      })
      .filter((pluginData: Plugin): boolean => {
        return !!pluginData.body;
      });
  } catch (error) {
    logger.error(error);
    return [];
  }
};
