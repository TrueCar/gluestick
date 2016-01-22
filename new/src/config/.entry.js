/** DO NOT MODIFY **/
import React, { Component } from "react";
import { render } from "react-dom";

import { Root } from "gluestick-shared";
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
      routingContext,
      radiumConfig,
      store
    } = this.props;

    return (
      <Root routingContext={routingContext} radiumConfig={radiumConfig} routes={routes} store={store} />
    );
  }
}

Entry.start = function () {
  render(<Entry radiumConfig={{userAgent: window.navigator.userAgent}} />, document.getElementById("main"));
};

