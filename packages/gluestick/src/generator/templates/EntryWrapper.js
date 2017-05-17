/* @flow */
import type { CreateTemplate } from '../../types';

module.exports = (createTemplate: CreateTemplate) => createTemplate`
/* @flow */

/** DO NOT MODIFY **/
import React, { Component } from "react";
import { render } from "react-dom";
import { AppContainer } from "react-hot-loader";
import { Root, getHttpClient } from "compiled/gluestick";
import originalMatch from "react-router/lib/match";
import browserHistory from "react-router/lib/browserHistory";

// Cache for HMR to store data between multiple rerenders.
const hotReloadCache: Object = {
  httpClient: null,
  store: null,
  rootWrappers: null,
  rootWrappersOptions: null,
  preRenderHooks: null,
};

const matchRouteAndRender = (
  { match, history },
  { getRoutes, store, httpClient },
  { rootWrappers, rootWrappersOptions, preRenderHooks }
) => {
  match({ history, routes: getRoutes(store, httpClient) }, (error, redirectLocation, renderProps) => {
    const entry = (
      <AppContainer>
        <EntryWrapper
          radiumConfig={{userAgent: window.navigator.userAgent}}
          store={store}
          getRoutes={getRoutes}
          httpClient={httpClient}
          rootWrappers={rootWrappers}
          rootWrappersOptions={{
            userAgent: window.navigator.userAgent,
            ...rootWrappersOptions
          }}
          {...renderProps}
        />
      </AppContainer>
    );

    if (preRenderHooks && preRenderHooks.length > 0) {
      preRenderHooks.forEach((hook) => {
        if (typeof hook === "function") { hook(); }
      });
    }
    render(entry, document.getElementById("main"));
  });
};

// Rerender whole app (for HMR purpose).
const rerender = (updatedGetRoutes) => {
  const { httpClient, store, rootWrappers, rootWrappersOptions, preRenderHooks } = hotReloadCache;

  matchRouteAndRender({
    match: originalMatch,
    history: browserHistory,
  }, {
    getRoutes: updatedGetRoutes,
    store,
    httpClient,
  }, {
    rootWrappers,
    rootWrappersOptions,
    preRenderHooks,
  });
};

// This function is called only on client on initial render.
const start = (
  config,
  getRoutes,
  getStore,
  { rootWrappers, rootWrappersOptions, preRenderHooks } = {},
  match = originalMatch,
  history = browserHistory
) => {
  // Allow developers to include code that will be executed before the app is
  // set up in the browser.
  require("config/init.browser");

  const httpClient = getHttpClient(config.httpClient);
  const store = getStore(httpClient);

  if (process.env.NODE_ENV !== "production") {
    hotReloadCache.httpClient = httpClient;
    hotReloadCache.store = store;
    hotReloadCache.rootWrappers = rootWrappers;
    hotReloadCache.rootWrappersOption = rootWrappersOptions;
    hotReloadCache.preRenderHooks = preRenderHooks;
  }

  matchRouteAndRender({
    match,
    history,
  }, {
    getRoutes,
    store,
    httpClient,
  }, {
    rootWrappers,
    rootWrappersOptions,
    preRenderHooks,
  });
};

export default class EntryWrapper extends Component {
  static start = start;
  static rerender = rerender;
  static defaultProps = {
    rootWrappers: [],
  }

  render () {
    const {
      routerContext,
      getRoutes,
      radiumConfig,
      store,
      httpClient,
      rootWrappers,
      rootWrappersOptions,
    } = this.props;

    return rootWrappers.reduce((prev, curr) => {
      return curr(prev, rootWrappersOptions);
    }, (
      <Root
        routerContext={routerContext}
        routes={getRoutes(store, httpClient)}
        store={store}
      />
    ));
  }
}
`;
