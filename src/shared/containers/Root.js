import React, { Component, PropTypes } from "react";
import { Router } from "react-router";
import { Provider } from "react-redux";
import createBrowserHistory from "history/lib/createBrowserHistory";

export default class Root extends Component {
    static propTypes = {
        routes: PropTypes.object,
        reducers: PropTypes.object,
        routerHistory: PropTypes.any,
        routingContext: PropTypes.object
    };

    static defaultProps = {
        routerHistory: typeof window !== "undefined" ? createBrowserHistory() : null
    };

    render () {
        const {
            routes,
            routerHistory,
            routingContext,
            store
        } = this.props;

        const router = this._renderRouter();

        return (
            <Provider store={store}>
                <div>
                    {router}
                </div>
            </Provider>
        );
    }

    _renderRouter () {
        const {
            routes,
            routingContext,
            routerHistory
        } = this.props;

        // server rendering
        if (routingContext) return routingContext;

        return (
            <Router history={routerHistory}>
                {routes}
            </Router>
        );
    }
}

