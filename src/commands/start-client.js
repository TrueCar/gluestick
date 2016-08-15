const path = require("path");
const webpack = require("webpack");
const process = require("process");
const express = require("express");
const proxy = require("http-proxy-middleware");

import getWebpackConfig from "../config/getWebpackClientConfig";

import { getLogger } from "../lib/server/logger";
const LOGGER = getLogger();

const APP_ROOT = process.cwd();
const APP_CONFIG_PATH = path.join(APP_ROOT, "src", "config", "application.js");
const APP_CONFIG = require(APP_CONFIG_PATH).default;
let ASSET_PATH = APP_CONFIG.assetPath;
if (ASSET_PATH.substr(-1) !== "/") {
  ASSET_PATH = ASSET_PATH + "/";
}

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const PORT = 8888;

// @TODO Make this value a function rather than a global, or better yet, get it passed in
const PUBLIC_PATH = ASSET_PATH;

process.env.NODE_PATH = path.join(__dirname, "../..");

module.exports = function () {
  const compiler = webpack(getWebpackConfig(APP_ROOT, APP_CONFIG, APP_CONFIG_PATH, IS_PRODUCTION));
  if (!IS_PRODUCTION) {
    const app = express();
    app.use(require("webpack-dev-middleware")(compiler, {
      noInfo: true,
      publicPath: PUBLIC_PATH
    }));
    app.use(require("webpack-hot-middleware")(compiler));

    // Proxy http requests from server to client in development mode
    app.use(proxy({
      changeOrigin: false,
      target: "http://localhost:8880",
      logLevel: LOGGER.level,
      logProvider: () => {
        return LOGGER;
      },
      onError: (err, req, res) => {
        // When the client is restarting, show our polling message
        res.status(200).sendFile("poll.html", {root: path.join(__dirname, "../lib")});
      }
    }));

    app.listen(PORT, "localhost", function (error) {
      if (error) {
        LOGGER.error(error);
        return;
      }

      LOGGER.info(`Server running on http://localhost:${PORT}`);
    });
  }
};

