/* @flow */

import type { MatchedRoute } from '../types';

export default async function runRouteHook(
  hookName: string,
  branch: MatchedRoute[],
  request?: any,
) {
  await Promise.all(
    branch
      .map(({ route, match }) => ({
        route,
        match,
        // $FlowFixMe
        hook: route.component[hookName],
      }))
      .filter(item => item.hook)
      .map(({ match, hook }) => hook(match, request)),
  );
}
