import fs from "fs-extra";
import path from "path";
import getWebpackAdditions from "./getWebpackAdditions";

function getBasePath () {
  return path.join(process.cwd(), "src", "config", ".entries");
}

export function getWebpackEntries () {
  const output = {};
  const cwd = process.cwd();
  const basePath = getBasePath();

  // setup default
  const entryPoints = {
    "/": {
      name: "main",
      routes: path.join(cwd, "src", "config", "routes"),
      reducers: path.join(cwd, "src", "reducers")
    },
    ...getWebpackAdditions().entryPoints
  };

  Object.keys(entryPoints).forEach((key) => {
    const entry = entryPoints[key];
    const fileName = entry.name.replace(/\W/, "-");
    output[key] = {
      ...entry,
      fileName: fileName,
      filePath: `${path.join(basePath, fileName)}.js`,
      routes: entry.routes || path.join(cwd, "src", "config", "routes", fileName),
      reducers: entry.reducers || path.join(cwd, "src", "reducers", fileName),
      index: entry.index || path.join(cwd, "Index")
    };
  });

  return output;
}


export default function buildWebpackEntries (isProduction) {
  const output = {};
  const basePath = getBasePath();

  // Clean slate
  fs.removeSync(basePath);
  fs.ensureDirSync(basePath);

  const entries = getWebpackEntries();
  for (const key in entries) {
    const entry = entries[key];
    const { filePath, fileName } = entry;
    fs.outputFileSync(filePath, getEntryPointContent(entry));
    output[fileName] = [path.join(__dirname, "..", "entrypoints", "client.js"), filePath];

    // Include hot middleware in development mode only
    if (!isProduction) {
      output[fileName].unshift("webpack-hot-middleware/client");
    }
  }

  return output;
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
  const store = createStore(httpClient, () => require("${reducers}"), middleware, (cb) => module.hot && module.hot.accept("${reducers}", cb), !!module.hot);
  return store;
}

if (typeof window === "object") {
  Entry.start(getRoutes, getStore);
}
`;

  return output;
}

