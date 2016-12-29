import fs from "fs-extra";
import path from "path";
import getWebpackAdditions from "./getWebpackAdditions";

function getBasePath () {
  return path.join(process.cwd(), "src", "config", ".entries");
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
      filePath: `${path.join(basePath, fileName)}-[chunkhash].js`,
      routes: entry.routes || path.join(cwd, "src", "config", "routes", fileName),
      reducers: entry.reducers || path.join(cwd, "src", "reducers", fileName),
      index: entry.index || path.join(cwd, "Index")
    };
  });

  return output;
}


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
      output[fileName].unshift("react-hot-loader/patch");
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
import React from "react";
import history from "react-router/lib/browserHistory";
import match from "react-router/lib/match";
import { AppContainer } from "react-hot-loader";
import { getHttpClient, createStore } from "gluestick-shared";
import { render } from "react-dom";

import "${index}";
import config from "${config}";
import Entry from "${mainEntry}";
import middleware from "${reduxMiddlewarePath}";

export function getStore (httpClient) {
  return createStore(httpClient, () => require("${reducers}"), middleware, (cb) => module.hot && module.hot.accept("${reducers}", cb), !!module.hot);
}

if (typeof window === "object") {
  const httpClient = getHttpClient(config.httpClient);

  // Allow developers to include code that will be executed before the app is
  // set up in the browser.
  require("../init.browser");

  const newStore = getStore(httpClient);
  match({ history, routes: getRoutes(newStore)}, (error, redirectLocation, renderProps) => {
    render((
      <AppContainer>
        <Entry
          radiumConfig={{userAgent: window.navigator.userAgent}}
          store={newStore}
          getRoutes={getRoutes}
          {...renderProps}
        />
      </AppContainer>
    ), document.getElementById("main"));

    if (module.hot) {
      module.hot.accept("../.entry", () => {
        const UpdateEntry = require("${mainEntry}").default;
        render((
          <AppContainer>
            <UpdatedEntry
              radiumConfig={{userAgent: window.navigator.userAgent}}
              store={newStore}
              getRoutes={getRoutes}
              {...renderProps}
            />
          </AppContainer>
        ), document.getElementById("main"));
      });
    }
  });
}
`;

  return output;
}

