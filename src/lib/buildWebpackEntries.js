import fs from "fs-extra";
import path from "path";
import getWebpackAdditions from "./getWebpackAdditions";

function getBasePath () {
  return path.join(process.cwd(), "src", "config", ".entries");
}

const filterEntries = (entries, groupOfEntries) => {
  if(groupOfEntries){
    return groupOfEntries.reduce((prev, curr) => {
      return Object.assign({}, prev, { [curr]: entries[curr] });
    }, {});
  }
  throw Error("No group of entries");
};

function buildEntries(entries, isProduction) {
  const output = {};
  for (const key in entries) {
    const entry = parseWebpackEntry(entries[key], isProduction);
    output[entry.fileName] = entry.conent;
  }
  return output;
}
/**
 * This method is a information preparer/gatherer. This information is used by
 * `buildWebpackEntries` and the server request handler. It sets up the default
 * entry point that will be used by most apps, as well as combining any
 * additional entry points specified in the webpack additions.
 */
export function getWebpackEntries () {
  const output = {};
  const cwd = process.cwd();
  const basePath = getBasePath();
  const webpackAdditions = getWebpackAdditions();
  // setup default
  const entryPoints = {
    "/": {
      name: "main",
      routes: path.join(cwd, "src", "config", "routes"),
      reducers: path.join(cwd, "src", "reducers")
    },
    ...webpackAdditions.entryPoints
  };
  Object.keys(entryPoints).forEach((key) => {
    const entry = entryPoints[key];
    const fileName = entry.name.replace(/\W/, "-");
    output[key] = {
      ...entry,
      fileName: fileName,
      filePath: `${path.join(basePath, fileName)}-[chunkhash].js`,
      routes: entry.routes || path.join(cwd, "src", "config", "routes", fileName),
      reducers: entry.reducers || path.join(cwd, "src", "reducers", fileName),
      index: entry.index || path.join(cwd, "Index"),
      entryPoints: entry.entryPoints || null
    };
  });
  return {
    mapEntryToGroup: webpackAdditions.mapEntryToGroup,
    entries: output
  };

}

const parseWebpackEntry = (entry, isProduction) => {
  const { filePath, fileName } = entry;
  fs.outputFileSync(filePath, getEntryPointContent(entry));
  const content = isProduction ? [] : [
    // eventsource-polyfill added here because it needs to go before
    // webpack-hot-middleware pointing to local node_modules so it pulls from
    // gluestick project and not from the app. This is needed to support HMR in
    // browsers like IE11
    path.join(__dirname, "..", "..", "node_modules", "eventsource-polyfill"),
    // Include hot middleware in development mode only
    "webpack-hot-middleware/client"
  ];
  return {
    fileName,
    conent: content.concat([path.join(__dirname, "..", "entrypoints", "client.js"), filePath])
  };
};

/**
 * This method will wipe out the `config/.entries` hidden folder and rebuild it
 * it based on the defined entry points. It creates entry point files for each
 * of the entry points and returns the hash that webpack uses when bundling
 * code.
 *
 * Each entry point will be an array including the shared client entry point
 * file which includes global dependencies like the babel polyfill. It then
 * includes the generated entry point. Finally, if we are in development mode
 * it will start the array off with the webpack hot middleware client.
 */
export default function buildWebpackEntries (isProduction, entrypointToBuild) {
  const output = {};
  const basePath = getBasePath();

  // Clean slate
  fs.removeSync(basePath);
  fs.ensureDirSync(basePath);
  const { mapEntryToGroup, entries } = getWebpackEntries();
  if (entrypointToBuild && entrypointToBuild[0] === "/") {
    const entry = parseWebpackEntry(entries[entrypointToBuild], isProduction);
    output[entry.fileName] = entry.conent;
    return output;
  } else if (entrypointToBuild) {
    const filtredEntries = filterEntries(entries, mapEntryToGroup[entrypointToBuild]);
    return buildEntries(filtredEntries, isProduction);
  }
  return  buildEntries(entries, isProduction);
}

function getEntryPointContent (entry) {
  const cwd = process.cwd();
  const { routes, index, reducers } = entry;
  const reduxMiddlewarePath = path.join(cwd, "src", "config", "redux-middleware");
  const config = path.join(cwd, "src", "config", "application");
  const mainEntry = path.join(cwd, "src", "config", ".entry");
  const output = `import getRoutes from "${routes}";

// Make sure that webpack considers new dependencies introduced in the Index
// file
import "${index}";
import config from "${config}";
import Entry from "${mainEntry}";
import { createStore } from "gluestick-shared";
import middleware from "${reduxMiddlewarePath}";

export function getStore (httpClient) {
  return createStore(httpClient, () => require("${reducers}"), middleware, (cb) => module.hot && module.hot.accept("${reducers}", cb), !!module.hot);
}

if (typeof window === "object") {
  Entry.start(getRoutes, getStore);
}
`;

  return output;
}

