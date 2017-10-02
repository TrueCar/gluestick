/* @flow */
import type { CreateTemplate } from '../../types';

module.exports = (createTemplate: CreateTemplate) => createTemplate`
/* @flow */

/** DO NOT MODIFY **/
import React, { Component } from "react";
import { render } from "react-dom";
import { AppContainer } from "react-hot-loader";
import { Root } from "compiled/gluestick";

// Cache for HMR to store data between multiple rerenders.
const hotReloadCache: Object = {
  httpClient: null,
  store: null,
  rootWrappers: null,
  rootWrappersOptions: null,
  preRenderHooks: null,
};

function startRender(
  { routes, store, httpClient },
  { rootWrappers, rootWrappersOptions, preRenderHooks }
) {

  function _startRender() {
    if (preRenderHooks && preRenderHooks.length > 0) {
      preRenderHooks.forEach((hook) => {
        if (typeof hook === "function") { hook(); }
      });
    }
    render(
      <Root
        store={store}
        routes={routes}
        httpClient={httpClient}
        rootWrappers={rootWrappers}
        rootWrappersOptions={{
          userAgent: window.navigator.userAgent,
          ...rootWrappersOptions
        }}
      />,
      document.getElementById("main")
    );
  }

  if (process.env.NODE_ENV === "production") {
    _startRender();
  } else {
    const { runWithErrorUtils } = require("compiled/gluestick/shared/lib/errorUtils");

    runWithErrorUtils(_startRender);
  }
}

// Re-render whole app (for HMR purpose).
function renderClientApp(updatedGetRoutes) {
  const { httpClient, store, rootWrappers, rootWrappersOptions, preRenderHooks } = hotReloadCache;

  startRender({
    routes: updatedGetRoutes(store, httpClient),
    store,
    httpClient,
  }, {
    rootWrappers,
    rootWrappersOptions,
    preRenderHooks,
  });
}

// This function is called only on client on initial render.
function startClientApp(
  routes,
  store,
  httpClient,
  { rootWrappers, rootWrappersOptions, preRenderHooks } = {},
) {
  // Allow developers to include code that will be executed before the app is
  // set up in the browser.
  require("config/init.browser");

  if (process.env.NODE_ENV !== "production") {
    hotReloadCache.httpClient = httpClient;
    hotReloadCache.store = store;
    hotReloadCache.rootWrappers = rootWrappers;
    hotReloadCache.rootWrappersOption = rootWrappersOptions;
    hotReloadCache.preRenderHooks = preRenderHooks;
  }

  startRender({
    routes,
    store,
    httpClient,
  }, {
    rootWrappers,
    rootWrappersOptions,
    preRenderHooks,
  });
}

export default class Body extends Component {
  static start = startClientApp;
  static rerender = renderClientApp;
  static defaultProps = {
    rootWrappers: [],
  }

  render () {
    const {
      routes,
      store,
      httpClient,
      serverProps,
      rootWrappers,
      rootWrappersOptions,
    } = this.props;

    return rootWrappers.reduce((prev, curr) => {
      return curr(prev, rootWrappersOptions);
    }, (
      <AppContainer>
        <Root
          routes={routes}
          store={store}
          httpClient={httpClient}
          serverProps={serverProps}
        />
      </AppContainer>
    ));
  }
}
`;
