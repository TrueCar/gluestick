/* @flow */
import type { BaseLogger, Plugin } from '../types';

const readPlugins = require('./readPlugins');
const { createArrowList } = require('../cli/helpers');

let serverPluginsCache = [];

module.exports = (logger: BaseLogger, pluginsConfigPath: string): Plugin[] => {
  if (serverPluginsCache.length) {
    return serverPluginsCache;
  }

  const plugins = readPlugins(logger, pluginsConfigPath, 'server');
  if (plugins.length) {
    logger.info(`Including server plugins:\n${
      createArrowList(plugins.map(({ name }) => name), 9)
    }`);
  }

  serverPluginsCache = plugins;
  return plugins;
};
