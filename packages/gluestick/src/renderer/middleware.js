/* @flow */
import type {
  Request,
  Response,
  RenderRequirements,
  RenderOutput,
  CacheManager,
  RenderMethod,
} from '../types';

import hooks from './helpers/hooks';
import callHook from './helpers/callHook';

import config from '../config';
import logger from '../logger';

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
const serverPlugins = require('../plugins/serverPlugins');

const entries = require('project-entries').default;
const entriesConfig = require('project-entries-config');
const entriesPlugins = require('project-entries').plugins;
const EntryWrapper = require('entry-wrapper').default;
const BodyWrapper = require('./components/Body').default;
const applicationConfig = require('application-config').default;
const reduxMiddlewares = require('redux-middlewares').default;
const thunkMiddleware = require('redux-middlewares').thunkMiddleware;
const reduxEnhancers = require('redux-middlewares').enhancers;

const isProduction = process.env.NODE_ENV === 'production';

const envVariables: string[] =
  process.env.ENV_VARIABLES && Array.isArray(process.env.ENV_VARIABLES)
    ? process.env.ENV_VARIABLES
    : [];

type Middleware = (
  req: Request,
  res: Response,
  additional: {
    assets: Object,
  },
) => any;

const middleware: Middleware = async (req, res, { assets }) => {
  /**
   * TODO: better logging
   */
  const cacheManager: CacheManager = getCacheManager(logger, isProduction);
  try {
    const cachedBeforeHooks: string | null = cacheManager.getCachedIfProd(req);
    if (cachedBeforeHooks) {
      const cached = callHook(hooks.preRenderFromCache, cachedBeforeHooks);
      res.send(cached);
      return;
    }

    const requirementsBeforeHooks: RenderRequirements = getRequirementsFromEntry(
      { config, logger },
      req,
      entries,
    );
    const requirements = callHook(
      hooks.postRenderRequirements,
      requirementsBeforeHooks,
    );

    const httpClientOptions =
      requirements.config && requirements.config.httpClient
        ? requirements.config.httpClient
        : applicationConfig.httpClient;
    const httpClient: Function = getHttpClient(httpClientOptions, req, res);

    // Allow to specify different redux config
    const globalOptions = {
      middlewares: reduxMiddlewares,
      thunk: thunkMiddleware,
      enhancers: reduxEnhancers,
    };

    const appOptions =
      requirements.config && requirements.config.reduxOptions
        ? requirements.config.reduxOptions
        : {};

    const reduxOptions = { ...globalOptions, ...appOptions };

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
    const renderPropsAfterHooks: Object = callHook(
      hooks.postRenderProps,
      renderProps,
    );
    if (redirectLocation) {
      callHook(hooks.preRedirect, redirectLocation);
      res.redirect(
        301,
        `${redirectLocation.pathname}${redirectLocation.search}`,
      );
      return;
    }

    if (!renderPropsAfterHooks) {
      // This is only hit if there is no 404 handler in the react routes. A
      // not found handler is included by default in new projects.
      showHelpText(MISSING_404_TEXT, logger);
      res.sendStatus(404);
      return;
    }

    await runBeforeRoutes(store, renderPropsAfterHooks, {
      isServer: true,
      request: req,
    });

    const currentRouteBeforeHooks: Object =
      renderPropsAfterHooks.routes[renderPropsAfterHooks.routes.length - 1];
    const currentRoute: Object = callHook(
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

    // Get runtime plugins that will be passed to EntryWrapper.
    const runtimePlugins: Object[] = entriesPlugins
      .filter((plugin: Object) => plugin.type === 'runtime');

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
        entriesPlugins: runtimePlugins,
        entryWrapperConfig: {},
        envVariables,
      },
      {
        assets,
        loadjsConfig: applicationConfig.loadjsConfig || {},
        cacheManager,
      },
      { renderMethod },
    );
    const output: RenderOutput = callHook(hooks.postRender, outputBeforeHooks);
    res.status(statusCode).send(output.responseString);
  } catch (error) {
    callHook(hooks.error, error);
    logger.error(error instanceof Error ? error.stack : error);
    errorHandler({ config, logger }, req, res, error);
  }
};

module.exports = middleware;
