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
        routerHistory: createBrowserHistory()
    };

    render () {
        const {
            routes,
            routerHistory
        } = this.props;

        return (
            <Router history={routerHistory}>
                {routes}
            </Router>
        );
    }
}

