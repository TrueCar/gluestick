/* @flow */

import React, { Component, PropTypes } from 'react';
import { applyRouterMiddleware, Router, browserHistory } from 'react-router';
import { Provider } from 'react-redux';
import { useScroll } from 'react-router-scroll';

import prepareRoutesWithTransitionHooks from '../lib/prepareRoutesWithTransitionHooks';

type DefaultProps = {
  routerHistory: ?Object,
};

type Props = {
  /* eslint-disable */
  routes: Object;
  routerHistory: any;
  routerContext: Object;
  store: Object;
  /* eslint-enable */
};

type State = {
  mounted: boolean,
};

export default class Root extends Component<DefaultProps, Props, State> {
  static propTypes = {
    /* eslint-disable */
    routes: PropTypes.object,
    routerHistory: PropTypes.any,
    routerContext: PropTypes.object,
    store: PropTypes.object,
    /* eslint-enable */
  };

  static defaultProps: DefaultProps = {
    routerHistory: typeof window !== 'undefined' ? browserHistory : null,
  };

  state: State;
  props: Props;

  router: Object;

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
    const { store } = this.props;

    return (
      <Provider store={store}>
        {this.router}
      </Provider>
    );
  }

  _renderRouter(props: Props): Object | Component<*, *, *> {
    // server rendering
    if (props.routerContext) return props.routerContext;

    // router middleware
    const render: Function = applyRouterMiddleware(
      useScroll((prevRouterProps, { location, routes }) => {
        // If the user provides custom scroll behaviour, use it, otherwise fallback to the default
        // behaviour.
        const { useScroll: customScrollBehavior } =
          routes.find(route => route.useScroll) || {};

        if (typeof customScrollBehavior === 'function') {
          return customScrollBehavior(prevRouterProps, location);
        } else if (customScrollBehavior) {
          throw new Error('useScroll prop must be a function');
        }

        // Do not scroll on route change if a `ignoreScrollBehavior` prop is set to true on
        // route components in the app. e.g.
        // <Route ignoreScrollBehavior={true} path="mypage" component={MyComponent} />
        if (routes.some(route => route.ignoreScrollBehavior)) {
          return false;
        }
        return true;
      }),
    );

    const { routes, routerHistory } = props;

    return (
      <Router history={routerHistory} render={render}>
        {prepareRoutesWithTransitionHooks(routes)}
      </Router>
    );
  }
}
