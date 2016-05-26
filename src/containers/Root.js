import React, { Component, PropTypes } from "react";
import { Router, browserHistory } from "react-router";
import { Provider } from "react-redux";

import prepareRoutesWithTransitionHooks from "../lib/prepareRoutesWithTransitionHooks";

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

    return (
      <Provider store={store}>
          {this.router}
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
}

