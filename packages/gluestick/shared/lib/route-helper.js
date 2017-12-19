/* @flow */

import { match } from 'react-router';
import type { GetBeforeRoute } from '../types';

const getBeforeRoute: GetBeforeRoute = (component = {}) => {
  const c: Object = component.WrappedComponent || component;

  if (c.onEnter) {
    // If we're rendering on server, return function itself, so it will block rendering
    // until all data is fetched, but on client, we do not want to block navigation
    // so we wrap `onEnter` into another function, which immediately resolves.
    return typeof window === 'undefined'
      ? c.onEnter
      : (...args) => {
          c.onEnter(...args);
          return Promise.resolve();
        };
  }

  // @deprecated since 0.0.1
  // check for deprecated fetchData method
  if (c.fetchData) {
    console.warn(
      '`fetchData` is deprecated. Please use `gsBeforeRoute` instead.',
    );
  }

  if (c.gsBeforeRoute) {
    console.warn(
      '`gsBeforeRoute` is deprecated and will be removed in next versions.' +
        'Please use `withDataLoader` HOC instead.',
    );
  }

  return c.gsBeforeRoute || c.fetchData;
};

function getRouteComponents(routes) {
  const components: Object[] = [];
  routes.forEach(route => {
    if (route.components) {
      Object.values(route.components).forEach((c: any) => components.push(c));
    } else if (route.component) {
      components.push(route.component);
    }
  });

  return components;
}

/**
 * @param {ReduxStore} store the redux store
 * @param {Object} renderProps render properties
 * @param {Object} [serverProps] server specific properties
 * @param {Boolean} [serverProps.isServer] whether or not we are running from the
 * server
 * @param {Express.Request} [serverProps.request] if we are on the server, the
 * server request that triggered the method
 */
export function runBeforeRoutes(
  store: Object,
  renderProps: Object,
  serverProps: Object = { isServer: false },
): Promise<any[]> {
  const {
    params,
    location: query,
  }: { params: Object, location: Object } = renderProps;

  const promises: Promise<any>[] = getRouteComponents(renderProps.routes)
    .map(getBeforeRoute)
    .filter(Boolean) // Filter out nulls and undefined, so we are only left with functions.
    .map(beforeRoute => beforeRoute(store, params, query || {}, serverProps)); // call fetch data methods and save promises

  return Promise.all(promises);
}

export function createTransitionHook(
  store: Object,
  routes: Object[],
): Function {
  return function checkLocation(location: Object, cb: Function): void {
    match(
      { routes, location },
      async (error, redirectLocation, renderProps) => {
        // If `redirectLocation` is not empty, we need to check it again with new location,
        // otherwise `runBeforeRoutes` will throw error since `renderProps` is undefined
        if (redirectLocation) {
          checkLocation(redirectLocation, cb);
          return;
        }

        try {
          await runBeforeRoutes(store, renderProps);
        } catch (err) {
          console.error(err);
        } finally {
          cb();
        }
      },
    );
  };
}
