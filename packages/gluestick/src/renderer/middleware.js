const render = require('./render');
const getRequirementsFromEntry = require('./helpers/getRequirementsFromEntry');
const matchRoute = require('./helpers/matchRoute');
const { getHttpClient, createStore } = require('gluestick-shared');
const { showHelpText, MISSING_404_TEXT } = require('./helpers/helpText');
const setHeaders = require('./response/setHeaders');
const errorHandler = require('./helpers/errorHandler');
const getCacheManager = require('./helpers/cacheManager');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = async (
  { config, logger },
  req,
  res,
  { entries, entriesConfig },
  { EntryWrapper, BodyWrapper },
  assets,
  options = { envVariables: [], httpClient: {}, entryWrapperConfig: {} },
) => {
  /**
   * TODO: add hooks
   * TODO: better logging
   */
  const cacheManager = getCacheManager(logger, isProduction);
  try {
    // If we have cached item then render it.
    const cached = cacheManager.getCachedIfProd(req);
    if (cached) {
      res.send(cached);
      return null;
    }

    const requirements = getRequirementsFromEntry(
      { config, logger },
      req, entries,
    );

    const httpClient = getHttpClient(options.httpClient, req, res);
    const store = createStore(
      httpClient,
      () => requirements.reducers,
      [],
      (cb) => module.hot && module.hot.accept(entriesConfig[requirements.name].reducers, cb),
      !!module.hot,
    );
    const {
      redirectLocation,
      renderProps,
    } = await matchRoute(
      { config, logger },
      req, requirements.routes, store, httpClient,
    );

    if (redirectLocation) {
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

    const currentRoute = renderProps.routes[renderProps.routes.length - 1];
    setHeaders(res, currentRoute);

    // This will be used when streaming generated response or from cache.
    // const statusCode = getStatusCode(store.getState(), currentRoute);

    const output = render(
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
    res.send(output.responseString);
    return null;
  } catch (error) {
    logger.error(error);
    errorHandler(
      { config, logger },
      req,
      res,
      error,
    );
  }
  return null;
};
