/* @flow */

type Component = {
  WrappedComponent?: Object;
  gsBeforeRoute?: (store: Object, params: Object, location?: Object, serverProps: Object) => void;
}

type Route = {
  component?: Component;
  components?: { [key: string]: Component };
}

const hooksHelper = (hooks: ?(Function | Function[]), arg?: any): any => {
  if (hooks) {
    return Array.isArray(hooks) ? hooks.reduce((val, hook) => hook(val), arg) : hooks(arg);
  }
  return arg;
};

const getComponentsHook = (component: Component = {}) => {
  const c = component.WrappedComponent || component;
  return c.gsBeforeRoute;
};

const getRouteComponents = (routes: Array<Route>) => {
  const components: Array<Component> = [];

  routes.forEach((route: Route) => {
    if (route.components) {
      // $FlowFixMe
      Object.values(route.components).forEach((c: Component) => components.push(c));
    } else if (route.component) {
      components.push(route.component);
    }
  });
  return components;
};

const callComponentsHooks = (
  store: Object,
  renderProps: { params: Object, location: Object, routes: Array<Route> },
  serverProps: Object,
) => {
  const { params, location, routes } = renderProps;
  const promises = getRouteComponents(routes)
  .map(getComponentsHook).filter(f => f) // only look at ones with a static gsBeforeRoute()
  .map(componentHook => componentHook && componentHook(store, params, location || {}, serverProps));

  return Promise.all(promises);
};

module.exports = {
  hooksHelper,
  callComponentsHooks,
};
