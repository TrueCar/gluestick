import React, { Component, PropTypes } from "react";
import { Router, Route, browserHistory } from "react-router"
import { Provider } from "react-redux";

import prepareRoutesWithTransitionHooks from "../lib/prepareRoutesWithTransitionHooks";
import RadiumConfig from "../components/RadiumConfig";
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
  }

  componentDidMount () {
    this.setState({mounted: true});
  }

  render () {
    const {
      routes,
      routerHistory,
      routerContext,
      radiumConfig,
      store
    } = this.props;

    const router = this._renderRouter();
    const devTools = this._renderDevTools();
    
    return (
      <Provider store={store}>
        <div>
          <RadiumConfig radiumConfig={radiumConfig}>
            {router}
          </RadiumConfig>
          {devTools}
        </div>
      </Provider>
    );
  }

  _renderRouter () {
    const {
      routes,
      routerContext,
      routerHistory
    } = this.props;

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

