/* @flow */

import React, { Component } from 'react';
import { StaticRouter } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import { Provider } from 'react-redux';
import wrapRouteComponents from '../lib/wrapRouteComponents';
// import { useScroll } from 'react-router-scroll';

type Props = {
  // httpClient: Object
  routes: any[],
  store: Object,
  // eslint-disable-next-line
  serverProps?: { location: string, context: Object },
};

export default class AppBodyRoot extends Component<void, Props, void> {
  props: Props;
  Router: React.Component<*, *, *>;
  routerProps: {
    location?: string,
    context?: {},
  };

  constructor(props: Props) {
    super(props);

    this.Router = StaticRouter;
    this.routerProps = {};
    if (typeof window !== 'undefined') {
      this.Router = BrowserRouter;
    }
  }

  render() {
    const { Router, routerProps, props: { routes, store, serverProps } } = this;

    if (serverProps) {
      routerProps.location = serverProps.location;
      routerProps.context = serverProps.context;
    }

    // @TODO: scrolling
    return (
      <Provider store={store}>
        {/* $FlowIgnore */}
        <Router {...routerProps}>
          {renderRoutes(wrapRouteComponents(routes))}
        </Router>
      </Provider>
    );
  }

  // _renderRouter(props: Props): Object | Component<*, *, *> {
  // server rendering
  // if (props.routerContext) return props.routerContext;

  // router middleware
  // const render: Function = applyRouterMiddleware(
  //   useScroll((prevRouterProps, { location, routes }) => {
  //     // Initial render - skip scrolling
  //     if (!prevRouterProps) {
  //       return false;
  //     }

  //     // If the user provides custom scroll behaviour, use it, otherwise fallback to the default
  //     // behaviour.
  //     const { useScroll: customScrollBehavior } =
  //       routes.find(route => route.useScroll) || {};

  //     if (typeof customScrollBehavior === 'function') {
  //       return customScrollBehavior(prevRouterProps, location);
  //     } else if (customScrollBehavior) {
  //       throw new Error('useScroll prop must be a function');
  //     }

  //     // Do not scroll on route change if a `ignoreScrollBehavior` prop is set to true on
  //     // route components in the app. e.g.
  //     // <Route ignoreScrollBehavior={true} path="mypage" component={MyComponent} />
  //     if (routes.some(route => route.ignoreScrollBehavior)) {
  //       return false;
  //     }
  //     return true;
  //   }),
  // );
  // }
}
