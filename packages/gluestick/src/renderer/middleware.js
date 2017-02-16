const render = require('./render');
const getRequirementsFromEntry = require('./helpers/getRequirementsFromEntry');
const matchRoute = require('./helpers/matchRoute');
const { getHttpClient, createStore } = require('gluestick-shared');
const { showHelpText, MISSING_404_TEXT } = require('./helpers/helpText');
const setHeaders = require('./response/setHeaders');
const errorHandler = require('./helpers/errorHandler');
const getCacheManager = require('./helpers/cacheManager');
// const getStatusCode = require('./helpers/getStatusCode');
const isProduction = process.env.NODE_ENV === 'production';
module.exports = async (
  req,
  res,
  { config, logger },
  { entries, entriesConfig },
  { EntryWrapper, BodyWrapper },
  assets,
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

    // Some config is passed when creating output, but don't know what it is exactly.
    const unknowConfig = {};
    const requirements = getRequirementsFromEntry(
      { config, logger },
      req, entries,
    );

    const httpClient = getHttpClient(unknowConfig, req, res);
    const store = createStore(
      httpClient,
      () => requirements.reducers,
      [],
      // What is that for?
      (cb) => module.hot && module.hot.accept(entriesConfig[requirements.name].reducers, cb),
      !!module.hot,
    );
    const {
      redirectLocation,
      renderProps,
    } = await matchRoute(
      { config, logger },
      req, requirements.routes, store, unknowConfig, httpClient,
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
      showHelpText(MISSING_404_TEXT);
      res.sendStatus(404, logger);
      return null;
    }

    const currentRoute = renderProps.routes[renderProps.routes.length - 1];
    setHeaders(res, currentRoute);

    // This will be used when streaming generated response or from cache.
    // const statusCode = getStatusCode(store.getState(), currentRoute);

    const output = await render(
      { config, logger },
      req,
      { EntryPoint: requirements.Component,
        entryName: requirements.name,
        store,
        routes: requirements.routes,
      },
      renderProps,
      unknowConfig,
      [],
      { EntryWrapper, BodyWrapper },
      assets,
      httpClient,
      cacheManager,
      currentRoute,
    );
    res.send(output.responseString);
    return null;
  } catch (error) {
    errorHandler(req, res, error, config);
  }
  return null;
};
