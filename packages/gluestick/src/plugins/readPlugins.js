/* @flow */
import type { Plugin, Logger } from '../types';

const { requireWithInterop } = require('../lib/utils');

module.exports = (logger: Logger, pluginsConfigPath: string, pluginType: string): Plugin[] => {
  try {
    const pluginsDeclaration: any[] = requireWithInterop(pluginsConfigPath);

    if (!Array.isArray(pluginsDeclaration)) {
      throw new Error('Invalid plugins configuration: must be an array');
    }

    pluginsDeclaration.forEach((pluginDeclaration: any): void => {
      if (
        !pluginDeclaration
        || (typeof pluginDeclaration !== 'string' && typeof pluginDeclaration !== 'object')
        || (typeof pluginDeclaration === 'object' && !pluginDeclaration.plugin)
      ) {
        throw new Error(`Invalid plugin declaration element: ${JSON.stringify(pluginDeclaration)}`);
      }
    });

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
