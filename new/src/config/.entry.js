/** DO NOT MODIFY **/
import React, { Component } from "react";
import { render } from "react-dom";

import { Root } from "gluestick-shared";
import { match } from "react-router";
import routes from "./routes";
import store from "./.store";
import { StyleRoot } from "radium";

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
      <StyleRoot radiumConfig={radiumConfig}>
        <Root routerContext={routerContext} routes={routes} store={store} />
      </StyleRoot>
    );
  }
}

Entry.start = function () {
  match({routes, location: window.location.pathname}, (error, redirectLocation, renderProps) => {
    render(<Entry radiumConfig={{userAgent: window.navigator.userAgent}} {...renderProps} />, document.getElementById("main"));
  });
};

