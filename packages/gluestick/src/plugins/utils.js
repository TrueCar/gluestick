/* @flow */

import type {
  ServerPlugin,
  Logger,
} from '../types';

type RenderMethod = (root: Object, styleTags: Object[]) =>
{ body: string; head: Object[], additionalScripts?: Object[] };

const _getRenderMethod = (plugins: ServerPlugin[], logger: Logger): ?RenderMethod => {
  const renderMethods = plugins
  .filter((plugin) => typeof plugin.renderMethod === 'function')
  .map(({ renderMethod }) => renderMethod);
  if (renderMethods.length > 1) {
    logger.warn('You have more than one render method!');
  }
  if (renderMethods && renderMethods.length > 0) {
    return renderMethods[renderMethods.length - 1];
  }
  return null;
};

module.exports = (logger: Logger) => ({
  getRenderMethod: (plugins: ServerPlugin[]) => _getRenderMethod(plugins, logger),
});
