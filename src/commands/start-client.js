const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const process = require("process");
const express = require("express");
const proxy = require("http-proxy-middleware");
const WebpackIsomorphicToolsPlugin = require("webpack-isomorphic-tools/plugin");
const webpackSharedConfig = require("../config/webpack-shared-config");
const detectEnvironmentVariables = require("../lib/detectEnvironmentVariables");
const getWebpackAdditions = require("../lib/getWebpackAdditions").default;
const buildWebpackEntries = require("../lib/buildWebpackEntries").default;
const { additionalLoaders, additionalPreLoaders, vendor, plugins } = getWebpackAdditions();
const logger = require("../lib/logger");
const logsColorScheme = require("../lib/logsColorScheme");

let assetPath = require(path.join(process.cwd(), "src", "config", "application")).default.assetPath;
if (assetPath.substr(-1) !== "/") {
  assetPath = assetPath + "/";
}

const PORT = 8888;
const OUTPUT_PATH = path.join(process.cwd(), "build");
const OUTPUT_FILE = "app.bundle.js";
const PUBLIC_PATH = assetPath;

const webpackIsomorphicToolsPlugin = new WebpackIsomorphicToolsPlugin(require("../config/webpack-isomorphic-tools-config"))
  .development(process.env.NODE_ENV !== "production");

process.env.NODE_PATH = path.join(__dirname, "../..");
const isProduction = process.env.NODE_ENV === "production";

let environmentPlugins = [];

if (isProduction) {
  environmentPlugins = environmentPlugins.concat([
    webpackIsomorphicToolsPlugin,
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  ]);
}
else {
  environmentPlugins = environmentPlugins.concat([
    webpackIsomorphicToolsPlugin,
    new webpack.HotModuleReplacementPlugin(),
  ]);
}

// The config/application.js file is consumed on both the server side and the
// client side. However, we want developers to have access to environment
// constiables in there so they can override defaults with an environment
// constiable. For that reason we are going to perform static analysis on that
// file to determine all of the environment constiables that are used in that
// file and make sure that webpack makes those available in the application.
const configEnvVariables = detectEnvironmentVariables(path.join(process.cwd(), "src", "config", "application.js"));
configEnvVariables.push("NODE_ENV");
const exposedEnvironmentVariables = {};
configEnvVariables.forEach((v) => {
  exposedEnvironmentVariables[v] = JSON.stringify(process.env[v]);
});

const compiler = webpack({
  context: process.cwd(),
  devtool: isProduction ? null : "cheap-module-eval-source-map",
  entry: {
    ...buildWebpackEntries(isProduction),
    vendor: vendor
  },
  module: {
    loaders: [
    ].concat(webpackSharedConfig.loaders, additionalLoaders),
    preLoaders: [
    // only place client specific preLoaders here
    ].concat(webpackSharedConfig.preLoaders, additionalPreLoaders),
  },
  node: {
    fs: "empty"
  },
  output: {
    path: OUTPUT_PATH,
    filename: `[name]-${OUTPUT_FILE}`,
    chunkFilename: `[name]-chunk-${OUTPUT_FILE}`,
    publicPath: PUBLIC_PATH
  },
  plugins: [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      "process.env": exposedEnvironmentVariables
    }),
    new webpack.IgnorePlugin(/\.server(\.js)?$/),
    new webpack.optimize.CommonsChunkPlugin("vendor", "vendor.bundle.js"),
    new webpack.optimize.CommonsChunkPlugin("commons", "commons.bundle.js"),
    new webpack.optimize.AggressiveMergingPlugin()
  ].concat(environmentPlugins, webpackSharedConfig.plugins, plugins),
  resolve: {
    ...webpackSharedConfig.resolve
  }
});

module.exports = function (buildOnly) {
  if (!buildOnly && !isProduction) {
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
      onError: (err, req, res) => {
        // When the client is restarting, show our polling message
        res.status(200).sendFile("poll.html", {root: path.join(__dirname, "../lib")});
      }
    }));

    app.listen(PORT, "localhost", function (error) {
      if (error) {
        logger.error(error);
        return;
      }

      logger.success("Server running on http://localhost:" + PORT);
    });
  }
  else {
    logger.info("Bundling assets…");
    compiler.run((error, stats) => {
      fs.writeFileSync("webpack-bundle-stats.json", JSON.stringify(stats.toJson()));
      const errors = stats.toJson().errors;
      if (errors.length) {
        errors.forEach((e) => {
          logger.error(e);
        });
        return;
      }

      logger.success("Assets have been prepared for production.");
      logger.success(`Assets can be served from the ${logsColorScheme.filename("/assets")} route but it is recommended that you serve the generated ${logsColorScheme.filename("build")} folder from a Content Delivery Network`);
    });
  }
};

