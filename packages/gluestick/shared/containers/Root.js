import React, { Component, PropTypes } from 'react';
import { applyRouterMiddleware, Router, browserHistory } from 'react-router';
import { Provider } from 'react-redux';
import { useScroll } from 'react-router-scroll';

import prepareRoutesWithTransitionHooks from '../lib/prepareRoutesWithTransitionHooks';

type DefaultProps = {
  routerHistory: ?Object;
}

type Props = {
  /* eslint-disable */
  routes: Object;
  routerHistory: any;
  routerContext: Object;
  /* eslint-enable */
};

type State = {
  mounted: boolean;
}

export default class Root extends Component<DefaultProps, Props, State> {
  static propTypes = {
    /* eslint-disable */
    routes: PropTypes.object,
    routerHistory: PropTypes.any,
    routerContext: PropTypes.object,
    /* eslint-enable */
  };

  static defaultProps = {
    routerHistory: typeof window !== 'undefined' ? browserHistory : null,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      mounted: false,
    };

    this.router = this._renderRouter(props);
  }

  _setMounted() {
    this.setState({ mounted: true });
  }

  componentDidMount() {
    this._setMounted();
  }

  render() {
    const {
      store,
    } = this.props;

    return (
      <Provider store={store}>
        {this.router}
      </Provider>
    );
  }

  _renderRouter(props: Props) {
    const {
      routes,
      routerContext,
      routerHistory,
    } = props;

    // server rendering
    if (routerContext) return routerContext;

    // router middleware
    const render: Function = applyRouterMiddleware(
      useScroll((prevRouterProps, results) => {
        // Do not scroll on route change if a `ignoreScrollBehavior` prop is set to true on
        // route components in the app. e.g.
        // <Route ignoreScrollBehavior={true} path="mypage" component={MyComponent} />
        if (results.routes.some(route => route.ignoreScrollBehavior)) {
          return false;
        }
        return true;
      }),
    );

    return (
      <Router history={routerHistory} render={render}>
        {prepareRoutesWithTransitionHooks(routes)}
      </Router>
    );
  }
}
