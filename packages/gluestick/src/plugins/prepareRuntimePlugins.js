/* @flow */

import type { RuntimePlugin, Plugin, Logger } from '../types';

const readPlugins = require('./readPlugins');

module.exports = (logger: Logger, pluginsConfigPath: string): RuntimePlugin[] => {
  const pluginsConfig: RuntimePlugin[] = readPlugins(logger, pluginsConfigPath, 'runtime')
    .map((pluginSpec: Plugin): RuntimePlugin => {
      return {
        name: pluginSpec.name,
        meta: pluginSpec.meta,
        body: {
          rootWrapper: pluginSpec.plugin,
        },
      };
    });
  if (!pluginsConfig.length) {
    return [];
  }

  logger.info('Including runtime plugins:');
  pluginsConfig.forEach((plugin: RuntimePlugin): void => {
    logger.info(`  ${plugin.name}`);
  });

  return pluginsConfig;
};
