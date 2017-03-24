/* @flow */
import type { Logger, Plugin } from '../types';

const readPlugins = require('./readPlugins');

module.exports = (logger: Logger, pluginsConfigPath: string): Plugin[] => {
  const plugins = readPlugins(logger, pluginsConfigPath, 'runtime');
  if (plugins.length) {
    logger.info('Including runtime plugins:');
    plugins.forEach((value: Plugin) => {
      logger.info(`  ${value.name}`);
    });
  }
  return plugins;
};
