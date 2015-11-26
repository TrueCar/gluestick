import React, { Component, PropTypes } from "react";
import { Router } from "react-router";
import { Provider } from "react-redux";
import createBrowserHistory from "history/lib/createBrowserHistory";

export default class Root extends Component {
    static propTypes = {
        routes: PropTypes.object,
        reducers: PropTypes.object,
        routerHistory: PropTypes.any
    };

    static defaultProps = {
        routerHistory: typeof window !== "undefined" ? createBrowserHistory() : null
    };

    render () {
        const {
            routes,
            routerHistory,
            store
        } = this.props;

        return (
            <Provider store={store}>
                <Router history={routerHistory}>
                    {routes}
                </Router>
            </Provider>
        );
    }
}

