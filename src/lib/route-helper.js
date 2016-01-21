const getBeforeRoute = (component = {}) => {
  const c = component.WrappedComponent || component;

  // @deprecated since 0.2
  // check for deprecated fetchData method
  if (c.fetchData) {
    console.warn("`fetchData` is deprecated. Please use `gsBeforeRoute` instead.");
  }

  return c.gsBeforeRoute || c.fetchData;
};

function getRouteComponents(routes) {
  const components = [];

  routes.forEach(route => {
    if (route.components)
      Object.values(route.components).forEach(c => components.push(c));
    else if (route.component)
      components.push(route.component);
  });

  return components;
}

/**
 * @param {ReduxStore} store the redux store
 * @param {Object} renderProps render properties
 * @param {Object} [serverProps] server specific properties
 * @param {Boolean} [serverProps.isServer] whether or not we are running from the
 * server
 * @param {Express.Request} [serverProps.request] if we are on the server, the
 * server request that triggered the method
 */
export function runBeforeRoutes (store, renderProps, serverParams) {
  const { params, location: query } = renderProps;
  serverParams = serverParams || {isServer: false};

  const promises = getRouteComponents(renderProps.routes)
  .map(getBeforeRoute).filter(f => f) // only look at ones with a static gsBeforeRoute()
  .map(beforeRoute => beforeRoute(store, params, query || {}, serverParams));  // call fetch data methods and save promises

  return Promise.all(promises)
}

export function createTransitionHook (store, history) {
  return function(location, cb) {
    history.match(location, async function (error, redirectLocation, renderProps) {
      try {
        await runBeforeRoutes(store, renderProps)
      } catch(err) {
        console.error(err);
      } finally {
        cb();
      }
    });
  };
}

