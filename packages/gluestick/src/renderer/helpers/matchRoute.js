/* @flow */
import type { Context, Request } from '../../types';

const { match } = require('react-router');
const { prepareRoutesWithTransitionHooks } = require('../../../shared');

module.exports = (
  { config, logger }: Context,
  req: Request,
  getRoutes: (store: Object, httpClient: Object) => Object,
  store: Object,
  httpClient: Object,
) => {
  return new Promise((resolve, reject) => {
    const routes: Object = prepareRoutesWithTransitionHooks(
      getRoutes(store, httpClient),
    );
    match(
      { routes, location: req.url },
      (error: any, redirectLocation: Object, renderProps: Object) => {
        if (error) {
          reject(error);
          return;
        }

        resolve({ redirectLocation, renderProps });
      },
    );
  });
};
