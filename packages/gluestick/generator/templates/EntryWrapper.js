/* @flow */
import type { CreateTemplate } from '../../src/types';

module.exports = (createTemplate: CreateTemplate) => createTemplate`
/* @flow */

/** DO NOT MODIFY **/
import React, { Component } from "react";
import { render } from "react-dom";
import { AppContainer } from "react-hot-loader";
import { Root, getHttpClient } from "compiled/gluestick";
import originalMatch from "react-router/lib/match";
import browserHistory from "react-router/lib/browserHistory";

let hotReloadCache = [];

// This function is called only on client.
const start = (
  config,
  getRoutes,
  getStore,
  { rootWrappers, rootWrappersOptions, preRenderHooks } = {},
  match = originalMatch,
  history = browserHistory
) => {
  hotReloadCache = [
    config,
    getRoutes,
    getStore,
    { rootWrappers, rootWrappersOptions, preRenderHooks },
    match,
    history,
  ];

  // Allow developers to include code that will be executed before the app is
  // set up in the browser.
  require("config/init.browser");

  const httpClient = getHttpClient(config.httpClient);
  const store = getStore(httpClient);
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

if (module.hot) {
  module.hot.accept('./EntryWrapper.js', () => {
    start(...hotReloadCache);
  });
}

export default class EntryWrapper extends Component {
  static start = start;
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
