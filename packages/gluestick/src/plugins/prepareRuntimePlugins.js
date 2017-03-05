/* @flow */

import type { RuntimePlugin, Plugin, Logger } from '../types';

const readPlugins = require('./readPlugins');

/**
 * Prepare runtime plugins, which does not need compilation.
 * They should be injected into project code, and executed from within project bundle.
 */
module.exports = (logger: Logger, pluginsConfigPath: string): RuntimePlugin[] => {
  const pluginsConfig: RuntimePlugin[] = readPlugins(logger, pluginsConfigPath, 'runtime')
    .map((pluginSpec: Plugin): RuntimePlugin => {
      // Normalize each plugin to common format.
      // Currently on `rootWrapper` function is processed.
      return {
        name: pluginSpec.name,
        meta: pluginSpec.meta,
        body: {
          rootWrapper: pluginSpec.body,
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
