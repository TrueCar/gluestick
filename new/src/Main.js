import React, { Component } from "react";

import { Root } from "gluestick";
import routes from "./config/routes";
import store from "./lib/store";

export default class Main extends Component {
    render () {
        const {
            routingContext,
            radiumConfig
        } = this.props;

        return (
            <Root routingContext={routingContext} radiumConfig={radiumConfig} routes={routes} store={store} />
        );
    }
}

