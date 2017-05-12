/* @flow */
import type { BaseLogger, Plugin } from '../types';

const readPlugins = require('./readPlugins');

module.exports = (logger: BaseLogger, pluginsConfigPath: string): Plugin[] => {
  const plugins = readPlugins(logger, pluginsConfigPath, 'server');
  if (plugins.length) {
    logger.info('Including server plugins:');
    plugins.forEach((value: Plugin) => {
      logger.info(`  ${value.name}`);
    });
  }
  return plugins;
};
