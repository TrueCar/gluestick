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
  ComponentsCachingConfig,
} from '../types';

const React = require('react');
const { matchRoutes } = require('react-router-config');

const render = require('./render');
const getRequirementsFromEntry = require('./helpers/getRequirementsFromEntry');
const { getHttpClient, createStore, runRouteHook } = require('../../shared');
const { showHelpText, MISSING_404_TEXT } = require('./helpers/helpText');
const setHeaders = require('./response/setHeaders');
const errorHandler = require('./helpers/errorHandler');
const getCacheManager = require('./helpers/cacheManager');
const getStatusCode = require('./response/getStatusCode');
const { getRenderMethod } = require('./lib/renderUtils');

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

type RouteConfig = {
  component: React.Component<*>,
  exact: boolean,
  location: Location,
  path: string,
  routes: RouteConfig[],
  strict: boolean,
};

type MatchedRoute = {
  match: {
    isExact: boolean,
    params: any,
    path: string,
    url: string,
  },
  route: RouteConfig,
};

module.exports = async function gluestickMiddleware(
  { config, logger }: Context,
  req: Request,
  res: Response,
  { entries, entriesConfig, entriesPlugins }: EntriesArgs,
  { Body, BodyWrapper }: { Body: Object, BodyWrapper: Object },
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
) {
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
      return;
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

    const routes = requirements.routes(store, httpClient);

    const branch: MatchedRoute[] = hooksHelper(
      hooks.postRouteMatch,
      matchRoutes(routes, req.url),
    );

    if (!branch.length) {
      // This is only hit if there is no 404 handler in the react routes. A
      // not found handler is included by default in new projects.
      showHelpText(MISSING_404_TEXT, logger);
      res.sendStatus(404);
      return;
    }

    await runRouteHook('onEnter', branch, req);

    const currentRoute: Object = hooksHelper(
      hooks.postGetCurrentRoute,
      branch[branch.length - 1].route,
    );

    // @TODO: might need a refactor
    setHeaders(res, currentRoute);

    const renderMethod = getRenderMethod(logger, serverPlugins);

    const statusCode: number = getStatusCode(store, currentRoute);

    const outputBeforeHooks: RenderOutput = render(
      { config, logger },
      req,
      {
        EntryPoint: requirements.Component,
        entryName: requirements.name,
        store,
        routes,
        httpClient,
        currentRoute,
      },
      {
        Body,
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

    if (output.routerContext && output.routerContext.url) {
      const { url } = hooksHelper(hooks.preRedirect, output.routerContext);
      res.redirect(
        /^3/.test(statusCode.toString()) ? statusCode : 301,
        // $FlowFixMe
        url,
      );
    } else {
      res.status(statusCode).send(output.responseString);
    }
  } catch (error) {
    hooksHelper(hooks.error, error);
    logger.error(error instanceof Error ? error.stack : error);
    errorHandler({ config, logger }, req, res, error);
  }
};
