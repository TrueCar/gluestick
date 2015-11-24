import React, { Component, PropTypes } from "react";
import { Router } from "react-router";
import { Provider } from "react-redux";
import createBrowserHistory from "history/lib/createBrowserHistory";

import createStore from "../lib/createStore";

export default class Root extends Component {
    static propTypes = {
        routes: PropTypes.object,
        reducers: PropTypes.object,
        routerHistory: PropTypes.any
    };

    static defaultProps = {
        routerHistory: createBrowserHistory()
    };

    render () {
        const {
            routes,
            reducers,
            routerHistory
        } = this.props;

        return (
            <div>
                <Provider store={createStore(reducers)}>
                    <Router history={routerHistory}>
                        {routes}
                    </Router>
                </Provider>
            </div>
        );
    }
}

