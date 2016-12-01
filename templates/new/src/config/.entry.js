/** DO NOT MODIFY **/
import React, { Component } from "react";

import { getHttpClient, Root } from "gluestick-shared";
import { StyleRoot } from "radium";
import config from "./application";

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
        <Root
          routerContext={routerContext}
          routes={getRoutes(store)}
          store={store}
        />
      </StyleRoot>
    );
  }
}

