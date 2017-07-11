/* @flow */

import type {
  Context,
  Request,
  Response,
  Entries,
  EntriesConfig,
  RenderRequirements,
  RenderOutput,
  CacheManager,
  GSHooks,
  ServerPlugin,
  RenderMethod,
  ComponentsCachingConfig,
} from '../types';

const render = require('./render');
const getRequirementsFromEntry = require('./helpers/getRequirementsFromEntry');
const matchRoute = require('./helpers/matchRoute');
const { getHttpClient, createStore, runBeforeRoutes } = require('../../shared');
const { showHelpText, MISSING_404_TEXT } = require('./helpers/helpText');
const setHeaders = require('./response/setHeaders');
const errorHandler = require('./helpers/errorHandler');
const getCacheManager = require('./helpers/cacheManager');
const getStatusCode = require('./response/getStatusCode');
const createPluginUtils = require('../plugins/utils');

const isProduction = process.env.NODE_ENV === 'production';

type Options = {
  envVariables: string[],
  httpClient: Object,
  entryWrapperConfig: Object,
  reduxMiddlewares: any[],
  thunkMiddleware: ?Function,
};

type EntriesArgs = {
  entries: Entries,
  entriesConfig: EntriesConfig,
  entriesPlugins: Object[],
};

module.exports = async (
  { config, logger }: Context,
  req: Request,
  res: Response,
  { entries, entriesConfig, entriesPlugins }: EntriesArgs,
  { EntryWrapper, BodyWrapper }: { EntryWrapper: Object, BodyWrapper: Object },
  { assets, loadjsConfig }: { assets: Object, loadjsConfig: Object },
  options: Options = {
    envVariables: [],
    httpClient: {},
    entryWrapperConfig: {},
    reduxMiddlewares: [],
    thunkMiddleware: null,
  },
  { hooks, hooksHelper }: { hooks: GSHooks, hooksHelper: Function },
  serverPlugins: ?(ServerPlugin[]),
  cachingConfig: ?ComponentsCachingConfig,
) => {
  /**
   * TODO: better logging
   */
  const cacheManager: CacheManager = getCacheManager(logger, isProduction);
  try {
    // If we have cached item then render it.
    cacheManager.enableComponentCaching(cachingConfig);
    const cachedBeforeHooks: string | null = cacheManager.getCachedIfProd(req);
    if (cachedBeforeHooks) {
      const cached = hooksHelper(hooks.preRenderFromCache, cachedBeforeHooks);
      res.send(cached);
      return Promise.resolve();
    }

    const requirementsBeforeHooks: RenderRequirements = getRequirementsFromEntry(
      { config, logger },
      req,
      entries,
    );
    const requirements = hooksHelper(
      hooks.postRenderRequirements,
      requirementsBeforeHooks,
    );

    const httpClientOptions =
      requirements.config && requirements.config.httpClient
        ? requirements.config.httpClient
        : options.httpClient;
    const httpClient: Function = getHttpClient(httpClientOptions, req, res);

    // Allow to specify different redux config
    const reduxOptions =
      requirements.config && requirements.config.reduxOptions
        ? requirements.config.reduxOptions
        : {
            middlewares: options.reduxMiddlewares,
            thunk: options.thunkMiddleware,
          };

    const store: Object = createStore(
      httpClient,
      () => requirements.reducers,
      reduxOptions.middlewares,
      cb =>
        module.hot &&
        // $FlowFixMe
        module.hot.accept(entriesConfig[requirements.key].reducers, cb),
      // $FlowFixMe
      !!module.hot,
      reduxOptions.thunk,
    );

    const {
      redirectLocation,
      renderProps,
    }: { redirectLocation: Object, renderProps: Object } = await matchRoute(
      { config, logger },
      req,
      requirements.routes,
      store,
      httpClient,
    );
    const renderPropsAfterHooks: Object = hooksHelper(
      hooks.postRenderProps,
      renderProps,
    );
    if (redirectLocation) {
      hooksHelper(hooks.preRedirect, redirectLocation);
      res.redirect(
        301,
        `${redirectLocation.pathname}${redirectLocation.search}`,
      );
      return Promise.resolve();
    }

    if (!renderPropsAfterHooks) {
      // This is only hit if there is no 404 handler in the react routes. A
      // not found handler is included by default in new projects.
      showHelpText(MISSING_404_TEXT, logger);
      res.sendStatus(404);
      return Promise.resolve();
    }

    await runBeforeRoutes(store, renderPropsAfterHooks, {
      isServer: true,
      request: req,
    });

    const currentRouteBeforeHooks: Object =
      renderPropsAfterHooks.routes[renderPropsAfterHooks.routes.length - 1];
    const currentRoute: Object = hooksHelper(
      hooks.postGetCurrentRoute,
      currentRouteBeforeHooks,
    );
    setHeaders(res, currentRoute);

    let renderMethod: RenderMethod;
    const pluginUtils = createPluginUtils(logger);
    const renderMethodFromPlugins =
      serverPlugins && pluginUtils.getRenderMethod(serverPlugins);
    if (renderMethodFromPlugins) {
      renderMethod = renderMethodFromPlugins;
    }

    const statusCode: number = getStatusCode(store, currentRoute);

    const outputBeforeHooks: RenderOutput = render(
      { config, logger },
      req,
      {
        EntryPoint: requirements.Component,
        entryName: requirements.name,
        store,
        routes: requirements.routes,
        httpClient,
      },
      { renderProps: renderPropsAfterHooks, currentRoute },
      {
        EntryWrapper,
        BodyWrapper,
        entriesPlugins,
        entryWrapperConfig: options.entryWrapperConfig,
        envVariables: options.envVariables,
      },
      { assets, loadjsConfig, cacheManager },
      { renderMethod },
    );
    const output: RenderOutput = hooksHelper(
      hooks.postRender,
      outputBeforeHooks,
    );
    res.status(statusCode).send(output.responseString);
    return Promise.resolve();
  } catch (error) {
    hooksHelper(hooks.error, error);
    logger.error(error instanceof Error ? error.stack : error);
    errorHandler({ config, logger }, req, res, error);
  }
  return Promise.resolve();
};
