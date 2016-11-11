/** DO NOT MODIFY **/
import React, { Component } from "react";
import { render } from "react-dom";

import { Root, getHttpClient } from "gluestick-shared";
import originalMatch from "react-router/lib/match";
import browserHistory from "react-router/lib/browserHistory";
import { StyleRoot } from "radium";
import config from "./application";

const httpClient = getHttpClient(config.httpClient);

export default class Entry extends Component {
  render () {
    const {
      routerContext,
      getRoutes,
      radiumConfig,
      store
    } = this.props;

    return (
      <StyleRoot radiumConfig={radiumConfig}>
        <Root routerContext={routerContext} routes={getRoutes(store)} store={store} />
      </StyleRoot>
    );
  }
}

Entry.start = function (getRoutes, getStore, match=originalMatch, history=browserHistory) {
  // Allow developers to include code that will be executed before the app is
  // set up in the browser.
  require("./init.browser");

  const newStore = getStore(httpClient);
  match({ history, routes: getRoutes(newStore)}, (error, redirectLocation, renderProps) => {
    const entry = (
      <Entry
        radiumConfig={{userAgent: window.navigator.userAgent}}
        store={newStore}
        getRoutes={getRoutes}
        {...renderProps}
      />
    );
    render(entry, document.getElementById("main"));
  });
};

