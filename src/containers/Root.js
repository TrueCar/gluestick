import React, { Component, PropTypes } from "react";
import { Router, Route, browserHistory } from "react-router"
import { Provider } from "react-redux";

import prepareRoutesWithTransitionHooks from "../lib/prepareRoutesWithTransitionHooks";
import DevTools from "./DevTools";

export default class Root extends Component {
  static propTypes = {
    routes: PropTypes.object,
    reducers: PropTypes.object,
    routerHistory: PropTypes.any,
    routerContext: PropTypes.object
  };

  static defaultProps = {
    routerHistory: typeof window !== "undefined" ? browserHistory : null
  };

  constructor (props) {
    super(props);
    this.state = {
      mounted: false
    };

    this.router = this._renderRouter(props);
  }

  componentDidMount () {
    this.setState({mounted: true});
  }

  render () {
    const {
      store
    } = this.props;

    const devTools = this._renderDevTools();
    
    return (
      <Provider store={store}>
        <div>
            {this.router}
            {devTools}
        </div>
      </Provider>
    );
  }

  _renderRouter (props) {
    const {
      routes,
      routerContext,
      routerHistory
    } = props;

    // server rendering
    if (routerContext) return routerContext;

    return (
      <Router history={routerHistory}>
          {prepareRoutesWithTransitionHooks(routes)}
      </Router>
    );
  }

  _renderDevTools () {
    if (!this.state.mounted || window.__GS_ENVIRONMENT__ === "production") return null;
    return (
      <DevTools />
    );
  }

}

