const createTemplate = module.parent.createTemplate;

const template = createTemplate`
import getRoutes from "${args => args.routes}";
import EntryWeapper from "../EntryWrapper";
import { createStore } from "gluestick-shared";
import middleware from "config/redux-middleware";
import reducers from "${args => args.reducers}";

import '${args => args.component}';

export const getStore = (httpClient) => {
  return createStore(
    httpClient,
    () => reducers,
    middleware,
    (cb) => module.hot && module.hot.accept('../../${args => args.reducers}', cb),
    !!module.hot
  );
};

if (typeof window === "object") {
  EntryWeapper.start(getRoutes, getStore);
}
`;

module.exports = (options) => {
  return {
    args: {
      component: options.component,
      routes: options.routes,
      reducers: options.reducers,
    },
    entry: {
      path: options.clientEntryInitPath,
      filename: `${options.name}.js`,
      template,
      overwrite: true,
    },
  };
};
