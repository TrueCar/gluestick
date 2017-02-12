const { match } = require('react-router');
const {
  // runBeforeRoutes as _runBeforeRoutes,
  prepareRoutesWithTransitionHooks,
  // ROUTE_NAME_404_NOT_FOUND,
} = require('gluestick-shared');

module.exports = ({ config, logger }, req, getRoutes, store, httpClient) => {
  return new Promise((resolve, reject) => {
    const routes = prepareRoutesWithTransitionHooks(getRoutes(store, httpClient));
    match({ routes, location: req.url }, (error, redirectLocation, renderProps) => {
      if (error) {
        reject(error);
        return;
      }

      resolve({ redirectLocation, renderProps });
    });
  });
};
