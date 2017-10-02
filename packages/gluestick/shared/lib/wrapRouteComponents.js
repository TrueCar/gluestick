/* @flow */

import React from 'react';
import { renderRoutes } from 'react-router-config';

export function withRoutes(
  RouteComponent: *,
  dependencies: { [key: string]: any },
) {
  const RouteComponentWrapper = ({ route, children, ...rest }: *) =>
    <RouteComponent {...rest} {...dependencies}>
      {children}
      {renderRoutes(route.routes)}
    </RouteComponent>;
  RouteComponentWrapper.displayName = `${RouteComponent.displayName ||
    RouteComponent.name ||
    'Unknown'}WithRoutes`;
  return RouteComponentWrapper;
}

export default function wrapRouteComponents(
  routes: *,
  dependencies: { [key: string]: any },
) {
  if (!routes) {
    return routes;
  }

  return Array.isArray(routes)
    ? routes.map(route => {
        return route.component
          ? {
              ...route,
              component: withRoutes(route.component, dependencies),
              routes: wrapRouteComponents(route.routes, dependencies),
            }
          : {
              ...route,
              routes: wrapRouteComponents(route.routes, dependencies),
            };
      })
    : wrapRouteComponents([routes], dependencies);
}
