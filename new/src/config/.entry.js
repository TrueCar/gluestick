/** DO NOT MODIFY **/
import React, { Component } from "react";
import { render } from "react-dom";

// Make sure that webpack considers new dependencies introduced in the Index
// file
import "../../Index.js";

import { Root } from "gluestick-shared";
import { match, browserHistory as history } from "react-router";
import routes from "./routes";
import store from "./.store";
import { StyleRoot } from "radium";

// @deprecated 0.3.9
// Returning routes directly, not through method is deprecated as of 0.3.9
// Soon this safety check will be removed. Deprecation notice currently served
// from server side rendering
let getRoutes = routes;
if (typeof routes !== "function") { getRoutes = () => routes; }

export default class Entry extends Component {
  static defaultProps = {
    store: store()
  };

  render () {
    const {
      routerContext,
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

Entry.start = function () {
  const newStore = store();
  match({ history, routes: getRoutes(newStore) }, (error, redirectLocation, renderProps) => {
    render(<Entry radiumConfig={{userAgent: window.navigator.userAgent}} store={newStore} {...renderProps} />, document.getElementById("main"));
  });
};

