const { convertToCamelCase } = require('../utils');

const createTemplate = module.parent.createTemplate;

const template = createTemplate`
import getRoutes from "${args => args.routes}";
import EntryWrapper from "../EntryWrapper";
import { createStore } from "gluestick-shared";
import middleware from "config/redux-middleware";
import reducers from "${args => args.reducers}";

import '${args => args.component}';

${args => args.plugins.reduce((prev, curr) => {
  return prev.concat(`import ${convertToCamelCase(curr.name)} from '${curr.name}/${curr.meta.type}';\n`);
}, '')}

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
  const rootWrappers = [
    ${args => args.plugins.reduce((prev, curr, index) => {
      return prev.concat(`${index > 0 ? '    ' : ''}${convertToCamelCase(curr.name)}`);
    }, '')}
  ];

  EntryWrapper.start(
    getRoutes,
    getStore,
    { rootWrappers },
  );
}
`;

module.exports = (options) => {
  return {
    args: {
      component: options.component,
      routes: options.routes,
      reducers: options.reducers,
      plugins: options.plugins,
    },
    entry: {
      path: options.clientEntryInitPath,
      filename: `${options.name}.js`,
      template,
      overwrite: true,
    },
  };
};
