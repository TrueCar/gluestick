const { convertToCamelCase } = require('../../src/utils');

const createTemplate = module.parent.createTemplate;

const template = createTemplate`
import getRoutes from "${args => args.routes}";
import EntryWrapper from "../EntryWrapper";
import { createStore } from "compiled/gluestick";
import middleware from "config/redux-middleware";
import reducers from "${args => args.reducers}";
${args => args.config ? `import config from "${args.config}";` : 'const config = {};'}

import "${args => args.component}";

${args => args.plugins.reduce((prev, curr) => {
  return prev.concat(`import ${convertToCamelCase(curr.name)} from "${curr.name}/${curr.meta.type}";\n`);
}, '')}

export const getStore = (httpClient) => {
  return createStore(
    httpClient,
    () => reducers,
    middleware,
    (cb) => module.hot && module.hot.accept("../../${args => args.reducers}", cb),
    !!module.hot
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
