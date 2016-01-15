const getFetchData = (component = {}) => {
  return component.WrappedComponent ?
    getFetchData(component.WrappedComponent) :
      component.fetchData;
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

export function fetchAllData(store, renderProps) {
  const { params, location: query } = renderProps;

  const promises = getRouteComponents(renderProps.routes)
  .map(getFetchData).filter(f => f) // only look at ones with a static fetchData()
  .map(fetchData => fetchData(store, params, query || {}));  // call fetch data methods and save promises

  return Promise.all(promises)
}

export function createTransitionHook(store, history) {
  return function(location, cb) {
    history.match(location, async function (error, redirectLocation, renderProps) {
      try {
        await fetchAllData(store, renderProps)
      } catch(err) {
        console.error(err);
      } finally {
        cb();
      }
    });
  };
}

