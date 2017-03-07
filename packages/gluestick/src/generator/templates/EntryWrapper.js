/* @flow */
import type { CreateTemplate } from '../../types';

module.exports = (createTemplate: CreateTemplate) => createTemplate`
/* @flow */

/** DO NOT MODIFY **/
import React, { Component } from "react";
import { render } from "react-dom";
import { Root, getHttpClient } from "gluestick-shared";
import originalMatch from "react-router/lib/match";
import browserHistory from "react-router/lib/browserHistory";

// This function is called only on client.
const start = (
  getRoutes,
  getStore,
  { rootWrappers, rootWrappersOptions, preRenderHooks } = {},
  match = originalMatch,
  history = browserHistory
) => {
  // Allow developers to include code that will be executed before the app is
  // set up in the browser.
  require("config/init.browser");

  const httpClient = getHttpClient(/*config.httpClient*/);
  const store = getStore(httpClient);
  match({ history, routes: getRoutes(store, httpClient) }, (error, redirectLocation, renderProps) => {
    const entry = (
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
    );
    if (preRenderHooks) {
      preRenderHooks.forEach((hook) => { hook(); });
    }
    render(entry, document.getElementById("main"));
  });
};

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
