/* @flow */

import React from 'react';
import { renderRoutes } from 'react-router-config';

export function withRoutes(RouteComponent: *) {
  const RouteComponentWrapper = ({ route, children, ...rest }: *) =>
    <RouteComponent {...rest}>
      {children}
      {renderRoutes(route.routes)}
    </RouteComponent>;
  RouteComponentWrapper.displayName = `${RouteComponent.displayName ||
    RouteComponent.name ||
    'Unknown'}WithRoutes`;
  return RouteComponentWrapper;
}

export default function wrapRouteComponents(routes: *) {
  return Array.isArray(routes)
    ? routes.map(route => {
        return route.component
          ? {
              ...route,
              component: withRoutes(route.component),
              routes: wrapRouteComponents(route.routes),
            }
          : {
              ...route,
              routes: wrapRouteComponents(route.routes),
            };
      })
    : routes;
}
