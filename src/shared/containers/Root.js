import React, { Component, PropTypes } from "react";
import { Router, Route } from "react-router";
import { Provider } from "react-redux";
import createBrowserHistory from "history/lib/createBrowserHistory";

import prepareRoutesWithTransitionHooks from "../../lib/prepareRoutesWithTransitionHooks";
import RadiumConfig from "../components/RadiumConfig";

// @TODO only do this if dev mode
import DevTools from "./DevTools";

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

    constructor (props) {
        super(props);
        this.state = {
            mounted: false
        };
    }

    componentDidMount () {
        this.setState({mounted: true});
    }

    render () {
        const {
            routes,
            routerHistory,
            routingContext,
            radiumConfig,
            store
        } = this.props;

        const router = this._renderRouter();
        const devTools = this._renderDevTools();

        return (
            <RadiumConfig radiumConfig={radiumConfig}>
                <Provider store={store}>
                    <div>
                        {router}
                        {devTools}
                    </div>
                </Provider>
            </RadiumConfig>
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
                {prepareRoutesWithTransitionHooks(routes)}
            </Router>
        );
    }

    _renderDevTools () {
        if (!this.state.mounted) return;
        return (
            <DevTools />
        );
    }

}

