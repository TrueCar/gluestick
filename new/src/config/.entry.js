/** DO NOT MODIFY **/
import React, { Component } from "react";

import { Root } from "gluestick";
import routes from "./routes";
import store from "./.store";

export default class Entry extends Component {
    static defaultProps = {
        store: store
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

