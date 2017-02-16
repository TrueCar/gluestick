const createTemplate = module.parent.createTemplate;

const template = createTemplate`
import getRoutes from "${args => args.routes}";
import EntryWeapper from "../EntryWrapper";
import { createStore } from "gluestick-shared";
import middleware from "config/redux-middleware";

export const getStore = (httpClient) => {
  return createStore(
    httpClient,
    () => require('apps/main/reducers/index'),
    middleware,
    (cb) => module.hot && module.hot.accept('../../src/apps/main/reducers', cb),
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
      routes: options.routes,
    },
    entry: {
      path: options.clientEntryInitPath,
      filename: `${options.name}.js`,
      template,
      overwrite: true,
    },
  };
};
