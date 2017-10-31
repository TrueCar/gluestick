/* @flow */

import type { ServerPlugin, BaseLogger, RenderMethod } from '../types';

const _getRenderMethod = (
  plugins: ServerPlugin[],
  logger: BaseLogger,
): ?RenderMethod => {
  const renderMethods = plugins
    .filter(plugin => typeof plugin.renderMethod === 'function')
    .map(({ renderMethod }) => renderMethod);
  if (renderMethods.length > 1) {
    logger.warn('You have more than one render method!');
  }
  if (renderMethods && renderMethods.length > 0) {
    return renderMethods[renderMethods.length - 1];
  }
  return null;
};

const _getCustomLogger = (plugins: ServerPlugin[]): ?BaseLogger => {
  const loggers = plugins
    .filter(plugin => plugin.logger)
    .map(({ logger }) => logger);
  if (loggers && loggers.length > 0) {
    return loggers[loggers.length - 1];
  }
  return null;
};

module.exports = (logger: BaseLogger) => ({
  getRenderMethod: (plugins: ServerPlugin[]) =>
    _getRenderMethod(plugins, logger),
  getCustomLogger: _getCustomLogger,
});
