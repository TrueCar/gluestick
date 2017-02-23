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
} from '../types';

const render = require('./render');
const getRequirementsFromEntry = require('./helpers/getRequirementsFromEntry');
const matchRoute = require('./helpers/matchRoute');
const { getHttpClient, createStore } = require('gluestick-shared');
const { showHelpText, MISSING_404_TEXT } = require('./helpers/helpText');
const setHeaders = require('./response/setHeaders');
const errorHandler = require('./helpers/errorHandler');
const getCacheManager = require('./helpers/cacheManager');

const isProduction = process.env.NODE_ENV === 'production';

type Options = {
  envVariables: string[];
  httpClient: Object;
  entryWrapperConfig: Object;
};

module.exports = async (
  { config, logger }: Context,
  req: Request,
  res: Response,
  { entries, entriesConfig }: { entries: Entries, entriesConfig: EntriesConfig },
  { EntryWrapper, BodyWrapper }: { EntryWrapper: Object, BodyWrapper: Object },
  assets: Object,
  options: Options = { envVariables: [], httpClient: {}, entryWrapperConfig: {} },
  hooks: Object,
) => {
  /**
   * TODO: add hooks
   * TODO: better logging
   */
  const cacheManager: CacheManager = getCacheManager(logger, isProduction);
  try {
    // If we have cached item then render it.
    const cached: string | null = cacheManager.getCachedIfProd(req);
    // load from cache hook(cached)
    if (cached) {
      res.send(cached);
      return null;
    }

    const requirements: RenderRequirements = getRequirementsFromEntry(
      { config, logger },
      req, entries,
    );
    // after requirements hook (requirements)

    const httpClient: Function = getHttpClient(options.httpClient, req, res);
    const store: Object = createStore(
      httpClient,
      () => requirements.reducers,
      [],
      // $FlowFixMe
      (cb) => module.hot && module.hot.accept(entriesConfig[requirements.name].reducers, cb),
      // $FlowFixMe
      !!module.hot,
    );
    const {
      redirectLocation,
      renderProps,
    }: { redirectLocation: Object, renderProps: Object } = await matchRoute(
      { config, logger },
      req, requirements.routes, store, httpClient,
    );

    if (redirectLocation) {
      // redirect hook(redirectLocation)
      res.redirect(
        301,
        `${redirectLocation.pathname}${redirectLocation.search}`,
      );
      return null;
    }

    if (!renderProps) {
      // This is only hit if there is no 404 handler in the react routes. A
      // not found handler is included by default in new projects.
      showHelpText(MISSING_404_TEXT, logger);
      res.sendStatus(404);
      return null;
    }

    const currentRoute: Object = renderProps.routes[renderProps.routes.length - 1];
    setHeaders(res, currentRoute);

    // This will be used when streaming generated response or from cache.
    // preRenderHook (EntryPoint, store, httpClient, renderProps, currentRoute)
    const output: RenderOutput = render(
      { config, logger },
      req,
      { EntryPoint: requirements.Component,
        entryName: requirements.name,
        store,
        routes: requirements.routes,
        httpClient,
      },
      { renderProps, currentRoute },
      {
        EntryWrapper,
        BodyWrapper,
        entryWrapperConfig: options.entryWrapperConfig,
        envVariables: options.envVariables,
      },
      { assets, cacheManager },
      {},
    );
    // post render hook (res, output);
    res.send(output.responseString);
    return null;
  } catch (error) {
    // error hook (error)
    logger.error(error instanceof Error ? error.stack : error);
    errorHandler(
      { config, logger },
      req,
      res,
      error,
    );
  }
  return null;
};
