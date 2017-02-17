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

export default class EntryWrapper extends Component {
  static start = start;
  render () {
    const {
      routerContext,
      getRoutes,
      radiumConfig,
      store,
      httpClient,
    } = this.props;

    return (
      <Root
        routerContext={routerContext}
        routes={getRoutes(store, httpClient)}
        store={store}
      />
    );
  }
}

// This function is called only on client.
const start = (getRoutes, getStore, match = originalMatch, history = browserHistory) => {
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
        {...renderProps}
      />
    );
    render(entry, document.getElementById("main"));
  });
};
`;
