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
        || typeof pluginDeclaration !== 'string'
        || (typeof pluginDeclaration === 'object' && !pluginDeclaration.plugin)
      ) {
        throw new Error('Invalid plugin declaration element');
      }
    });

    // $FlowIgnore
    return pluginsDeclaration.map((pluginDeclaration: any): Plugin => {
      return {
        name: typeof pluginDeclaration === 'string' ? pluginDeclaration : pluginDeclaration.plugin,
        plugin: requireWithInterop(pluginDeclaration),
        options: typeof pluginDeclaration === 'string' ? {} : pluginDeclaration.options,
      };
    }).filter((plugin: Plugin): boolean => {
      return plugin.plugin.meta.type === pluginType;
    });
  } catch (error) {
    logger.warn(error);
    return [];
  }
};
