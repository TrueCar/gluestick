const { convertToCamelCase } = require('../../utils');

const createTemplate = module.parent.createTemplate;

const template = createTemplate`
import getRoutes from "${args => args.routes}";
import EntryWrapper from "../EntryWrapper";
import { createStore } from "compiled/gluestick";
import globalMiddlewares, { thunkMiddleware as globalThunkMiddleware } from "config/redux-middleware";
${args => args.config ? `import config from "${args.config}";` : 'const config = {};'}

import "${args => args.component}";

${args => args.plugins.reduce((prev, curr) => {
  return prev.concat(`import ${convertToCamelCase(curr.name)} from "${curr.name}/build/${curr.meta.type}";\n`);
}, '')}

export const getStore = (httpClient) => {
  return createStore(
    httpClient,
    () => require("${args => args.reducers}").default,
    config.reduxOptions && config.reduxOptions.middlewares
      ? config.reduxOptions.middlewares
      : globalMiddlewares,
    (cb) => module.hot && module.hot.accept("../../${args => args.reducers}", cb),
    !!module.hot,
    config.reduxOptions && config.reduxOptions.thunk
      ? config.reduxOptions.thunk
      : globalThunkMiddleware,
  );
};

if (typeof window === "object") {
  const rootWrappers = [
    ${args => args.plugins.filter((plugin) => plugin.meta.wrapper).reduce((prev, curr, index) => {
      return prev.concat(`${index > 0 ? '    ' : ''}${convertToCamelCase(curr.name)}.plugin,\n`);
    }, '')}
  ];

  const preRenderHooks = [
    ${args => args.plugins.filter((plugin) => plugin.meta.hook).reduce((prev, curr, index) => {
      return prev.concat(`${index > 0 ? '    ' : ''}${convertToCamelCase(curr.name)}.plugin,\n`);
    }, '')}
  ];

  EntryWrapper.start(
    config,
    getRoutes,
    getStore,
    { rootWrappers, rootWrappersOptions: [], preRenderHooks },
  );

  if (module.hot) {
    module.hot.accept("${args => args.routes}", () => {
      EntryWrapper.rerender(require("${args => args.routes}").default);
    });
  }
}
`;

module.exports = (options) => {
  return {
    args: {
      component: options.component,
      routes: options.routes,
      reducers: options.reducers,
      config: options.config,
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
