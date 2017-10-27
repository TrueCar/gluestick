/* @flow */
import type { Context, Request } from "../../types";
const queryString = require("query-string");
const { match } = require("react-router");
const { prepareRoutesWithTransitionHooks } = require("../../../shared");
const parseUrl = require("url").parse;

module.exports = function matchRoute(
  context: Context,
  req: Request,
  getRoutes: (store: Object, httpClient: Object) => Object,
  store: Object,
  httpClient: Object,
) {
  return new Promise((resolve, reject) => {
    const routes: Object = prepareRoutesWithTransitionHooks(
      getRoutes(store, httpClient),
    );

    let location;
    try {
      queryString.parse(req.url);
      location = req.url;
    } catch (e) {
      location = parseUrl(req.url).pathname;
    }

    match(
      { routes, location },
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
