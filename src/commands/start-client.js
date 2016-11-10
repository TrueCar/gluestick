const path = require("path");
const webpack = require("webpack");
const process = require("process");
const express = require("express");
const proxy = require("http-proxy-middleware");
const fs = require("fs-extra");

import build from "./build";
import getWebpackConfig from "../config/getWebpackClientConfig";
import getAssetPath from "../lib/getAssetPath";

import { getLogger } from "../lib/server/logger";
const LOGGER = getLogger();

const APP_ROOT = process.cwd();
const APP_CONFIG_PATH = path.join(APP_ROOT, "src", "config", "application.js");
const ASSET_PATH = getAssetPath();

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const PORT = 8888;

// @TODO Make this value a function rather than a global, or better yet, get it passed in
const PUBLIC_PATH = ASSET_PATH;

process.env.NODE_PATH = path.join(__dirname, "../..");

module.exports = function () {
  // clean the slate by removing `webpack-asset.json` before building a new one
  fs.removeSync(path.join(process.cwd(), "webpack-assets.json"));

  const compiler = webpack(getWebpackConfig(APP_ROOT, APP_CONFIG_PATH, IS_PRODUCTION));

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
  else {
    build();
  }
};

