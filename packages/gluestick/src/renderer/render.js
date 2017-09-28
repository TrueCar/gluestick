/* @flow */
import type { Context, Request, RenderOutput, RenderMethod } from '../types';

const React = require('react');
const Oy = require('oy-vey').default;
const { renderToStaticMarkup } = require('react-dom/server');
const linkAssets = require('./helpers/linkAssets');
const { getRenderer } = require('./lib/renderUtils');

type EntryRequirements = {
  EntryPoint: Object,
  entryName: string,
  store: Object,
  routes: Object[],
  httpClient: Object,
  currentRoute: Object,
};
type WrappersRequirements = {
  Body: Object,
  BodyWrapper: Object,
  entryWrapperConfig: Object,
  envVariables: any[],
  entriesPlugins: { plugin: Function, meta: Object }[],
};
type AssetsCacheOpts = {
  assets: Object,
  loadjsConfig: Object,
  cacheManager: Object,
};

module.exports = function render(
  context: Context,
  req: Request,
  {
    EntryPoint,
    entryName,
    store,
    routes,
    httpClient,
    currentRoute,
  }: EntryRequirements,
  {
    Body,
    BodyWrapper,
    entryWrapperConfig,
    envVariables,
    entriesPlugins,
  }: WrappersRequirements,
  { assets, loadjsConfig, cacheManager }: AssetsCacheOpts,
  { renderMethod }: { renderMethod?: RenderMethod } = {},
): RenderOutput {
  const { styleTags, scriptTags } = linkAssets(
    context,
    entryName,
    assets,
    loadjsConfig,
  );
  const isEmail = !!currentRoute.email;
  const routerContext = {};
  const rootWrappers = entriesPlugins
    .filter(plugin => plugin.meta.wrapper)
    .map(({ plugin }) => plugin);

  // grab the react generated body stuff. This includes the
  // script tag that hooks up the client side react code.
  const currentState: Object = store.getState();

  const renderedBody: Object = getRenderer(isEmail, renderMethod)(
    <Body
      config={entryWrapperConfig}
      store={store}
      routes={routes}
      httpClient={httpClient}
      serverProps={{ location: req.url, context: routerContext }}
      rootWrappers={rootWrappers}
      rootWrappersOptions={{
        userAgent: req.headers['user-agent'],
      }}
    />,
    styleTags,
  );

  // Grab the html from the project which is stored in the root
  // folder named Index.js. Pass the body and the head to that
  // component. `head` includes stuff that we want the server to
  // always add inside the <head> tag.
  //
  // Bundle it all up into a string, add the doctype and deliver
  const rootElement = (
    <EntryPoint
      body={
        <BodyWrapper
          html={renderMethod ? renderedBody.body : renderedBody}
          initialState={currentState}
          isEmail={isEmail}
          envVariables={envVariables}
          scriptTags={scriptTags}
        />
      }
      head={isEmail ? null : renderedBody.head || styleTags}
      req={req}
    />
  );

  const docType: string = currentRoute.docType || '<!doctype html>';

  let responseString: string;
  if (isEmail) {
    const generateCustomTemplate = ({ bodyContent }) => {
      return `${docType}${bodyContent}`;
    };
    responseString = Oy.renderTemplate(rootElement, {}, generateCustomTemplate);
  } else {
    responseString = `${docType}${renderToStaticMarkup(rootElement)}`;
  }
  if (currentRoute.cache) {
    cacheManager.setCacheIfProd(req, responseString, currentRoute.cacheTTL);
  }
  return {
    routerContext,
    responseString,
    rootElement, // only for testing
  };
};
