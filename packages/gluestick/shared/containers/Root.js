/* @flow */

import * as React from 'react';
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

export default class Root extends React.Component<Props> {
  props: Props;
  Router: React.ComponentType<any>;
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
      function apply(target: Function, thisArg: any, args: any[]) {
        location.prev = { ...window.location };
        target.apply(thisArg, args);
        location.next = { ...window.location };
      }

      if (typeof window.Proxy !== 'undefined') {
        window.history[name] = new Proxy(window.history[name], {
          apply,
        });
      } else {
        const target = window.history[name];
        window.history[name] = function(...args: any[]) {
          apply(target, this || window.history, args);
        };
      }
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
