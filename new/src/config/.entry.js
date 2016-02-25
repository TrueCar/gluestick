/** DO NOT MODIFY **/
import React, { Component } from "react";
import { render } from "react-dom";

import { Root } from "gluestick-shared";
import { match } from "react-router";
import routes from "./routes";
import store from "./.store";

// Make sure that webpack considers new dependencies introduced in the Index
// file
import "../../Index.js";

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
      <Root routerContext={routerContext} radiumConfig={radiumConfig} routes={routes} store={store} />
    );
  }
}

Entry.start = function () {
  match({routes, location: window.location.pathname}, (error, redirectLocation, renderProps) => {
    render(<Entry radiumConfig={{userAgent: window.navigator.userAgent}} {...renderProps} />, document.getElementById("main"));
  });
};

