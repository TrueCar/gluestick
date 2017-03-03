/* @flow */
import type { Logger, Plugin } from '../types';

const readPlugins = require('./readPlugins');

module.exports = (logger: Logger, pluginsConfigPath: string): Plugin[] => {
  return readPlugins(logger, pluginsConfigPath, 'server');
};
