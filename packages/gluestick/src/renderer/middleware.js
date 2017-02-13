const render = require('./render');
const getRequirementsFromEntry = require('./helpers/getRequirementsFromEntry');
const matchRoute = require('./helpers/matchRoute');
const { getHttpClient, createStore } = require('gluestick-shared');
const { showHelpText, MISSING_404_TEXT } = require('./helpers/helpText');
const setHeaders = require('./response/setHeaders');
// const getStatusCode = require('./helpers/getStatusCode');

module.exports = async (
  req,
  res,
  { config, logger },
  entries,
  { EntryWrapper, BodyWrapper },
  assets,
) => {
  /**
   * TODO: cache, memoization
   * TODO: add hooks
   * TODO: error handling
   * TODO: rendering email?
   * TODO: render head with assets, js, css etc
   * TODO: check this hot reloading with redux
   * TODO: better logging
   */
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
    (cb) => module.hot && module.hot.accept('/Users/paweltrysla/Documents/testApp_v1/src/reducers', cb),
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
    return;
  }

  if (!renderProps) {
    // This is only hit if there is no 404 handler in the react routes. A
    // not found handler is included by default in new projects.
    showHelpText(MISSING_404_TEXT);
    res.sendStatus(404, logger);
    return;
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
  );
  res.send(output.responseString);
};
