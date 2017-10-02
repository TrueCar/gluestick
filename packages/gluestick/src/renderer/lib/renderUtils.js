/* @flow */
import type { BaseLogger, ServerPlugin, RenderMethod } from '../../types';

const { renderToString, renderToStaticMarkup } = require('react-dom/server');
const createPluginUtils = require('../../plugins/utils');

function getRenderMethod(logger: BaseLogger, serverPlugins: ?(ServerPlugin[])) {
  let renderMethod: RenderMethod;
  const pluginUtils = createPluginUtils(logger);
  const renderMethodFromPlugins =
    serverPlugins && pluginUtils.getRenderMethod(serverPlugins);
  if (renderMethodFromPlugins) {
    renderMethod = renderMethodFromPlugins;
  }
  return renderMethod;
}

function getRenderer(isEmail: boolean, renderMethod?: RenderMethod): Function {
  if (renderMethod) {
    return renderMethod;
  }
  return isEmail ? renderToStaticMarkup : renderToString;
}

module.exports = {
  getRenderMethod,
  getRenderer,
};
