/* @flow */
import type { BaseLogger, Plugin } from '../types';

const readPlugins = require('./readPlugins');
const { createArrowList } = require('../cli/helpers');

let runtimePluginsCache = [];

module.exports = (logger: BaseLogger, pluginsConfigPath: string): Plugin[] => {
  if (runtimePluginsCache.length) {
    return runtimePluginsCache;
  }

  const plugins = readPlugins(logger, pluginsConfigPath, 'runtime');
  if (plugins.length) {
    logger.info(
      `Including runtime plugins:\n${createArrowList(
        plugins.map(({ name }) => name),
        9,
      )}`,
    );
  }

  runtimePluginsCache = plugins;
  return plugins;
};
