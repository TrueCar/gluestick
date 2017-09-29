/* @flow */

import React, { Component } from 'react';
import { StaticRouter } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import { Provider } from 'react-redux';
import wrapRouteComponents from '../lib/wrapRouteComponents';

type Props = {
  // httpClient: Object
  routes: any[],
  store: Object,
  // eslint-disable-next-line
  serverProps?: { location: string, context: Object },
};

const location = {
  prev: typeof window !== 'undefined' ? { ...window.location } : {},
  next: {},
};

const routeDependencies = {
  getLocationDiff() {
    return { prev: { ...location.prev }, next: { ...location.next } };
  },
};

export default class Root extends Component<void, Props, void> {
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

  updateLocation = () => {
    location.prev = location.next;
    location.next = { ...window.location };
  };

  componentDidMount() {
    ['pushState', 'replaceState', 'go', 'back', 'forward'].forEach(name => {
      window.history[name] = new Proxy(window.history[name], {
        apply(target, thisArg, args) {
          location.prev = { ...window.location };
          target.apply(thisArg, args);
          location.next = { ...window.location };
        },
      });
    });

    window.addEventListener('popstate', this.updateLocation);
  }

  componentWillUnmount() {
    window.removeEventListener('popstate', this.updateLocation);
  }

  render() {
    const { Router, routerProps, props: { routes, store, serverProps } } = this;

    if (serverProps) {
      routerProps.location = serverProps.location;
      routerProps.context = serverProps.context;
    }

    return (
      <Provider store={store}>
        {/* $FlowIgnore */}
        <Router {...routerProps}>
          {renderRoutes(wrapRouteComponents(routes, routeDependencies))}
        </Router>
      </Provider>
    );
  }
}
