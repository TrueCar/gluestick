var path = require("path");
var webpack = require("webpack");
var process = require("process");
var chalk = require("chalk");
var express = require("express");
var proxy = require("express-http-proxy");
var WebpackIsomorphicToolsPlugin = require("webpack-isomorphic-tools/plugin");
var shared = require("../lib/shared");
var detectEnvironmentVariables = require("../lib/detectEnvironmentVariables");
var getWebpackAdditions = require("../lib/get-webpack-additions");
var { additionalLoaders, additionalPreLoaders } = getWebpackAdditions();
var { assetPath } = require(path.join(process.cwd(), "src", "config", "application"));

if (assetPath.substr(-1) !== "/") {
  assetPath = assetPath + "/";
}

var PORT = 8888;
var OUTPUT_PATH = path.join(process.cwd(), "build");
var OUTPUT_FILE = "main-bundle.js";
var PUBLIC_PATH = assetPath;

var webpackIsomorphicToolsPlugin = new WebpackIsomorphicToolsPlugin(require('../lib/webpack-isomorphic-tools-configuration'))
  .development(process.env.NODE_ENV !== "production");

process.env.NODE_PATH = path.join(__dirname, "../..");
const isProduction = process.env.NODE_ENV === "production";

var entry = [
  path.join(__dirname, "../entrypoints/client.js")
];

var environmentPlugins = [];

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

// Include hot middleware in development mode only
if (!isProduction) {
  entry.unshift("webpack-hot-middleware/client");
}


// The config/application.js file is consumed on both the server side and the
// client side. However, we want developers to have access to environment
// variables in there so they can override defaults with an environment
// variable. For that reason we are going to perform static analysis on that
// file to determine all of the environment variables that are used in that
// file and make sure that webpack makes those available in the application.
var configEnvVariables = detectEnvironmentVariables(path.join(process.cwd(), "src", "config", "application.js"));
configEnvVariables.push("NODE_ENV");
var exposedEnvironmentVariables = {};
configEnvVariables.forEach((v) => {
  exposedEnvironmentVariables[v] = JSON.stringify(process.env[v]);
});

var compiler = webpack({
  context: process.cwd(),
  devtool: isProduction ? undefined : "eval",
  entry: {
    "main": entry
  },
  module: {
    loaders: [
    ].concat(shared.loaders, additionalLoaders),
    preLoaders: [
    // only place client specific preLoaders here
  ].concat(shared.preLoaders, additionalPreLoaders),
  },
  output: {
    path: OUTPUT_PATH,
    filename: OUTPUT_FILE,
    chunkFilename: `[name]-${OUTPUT_FILE}`,
    publicPath: PUBLIC_PATH
  },
  plugins: [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      "__PATH_TO_ENTRY__": JSON.stringify(path.join(process.cwd(), "src/config/.entry")),
      "process.env": exposedEnvironmentVariables
    }),
    new webpack.IgnorePlugin(/\.server(\.js)?$/)
  ].concat(environmentPlugins, shared.plugins),
  resolve: {
    ...shared.resolve
  }
});

module.exports = function (buildOnly) {
  if (!buildOnly && !isProduction) {
    var app = express();
    app.use(require("webpack-dev-middleware")(compiler, {
      noInfo: true,
      publicPath: PUBLIC_PATH
    }));
    app.use(require("webpack-hot-middleware")(compiler));
    app.use(proxy("localhost:8880", {
      forwardPath: function (req, res) {
        return require("url").parse(req.url).path;
      },
      preserveHostHdr: true
    }));
    app.use(function(err, req, res, next) {
      if (err && err.code == "ECONNREFUSED") {
        // render a friendly loading page during server restarts
        res.status(200).sendFile("poll.html", {root: path.join(__dirname, "../lib")});
      }
      else {
        next(err);
      }
    });
    app.listen(PORT, "localhost", function (error) {
      if (error) {
        console.log(error);
        return;
      }

      console.log(chalk.green("Server running on http://localhost:" + PORT));
    });
  }
  else {
    console.log(chalk.yellow("Bundling assets…"));
    compiler.run(() => {
      console.log(chalk.green("Assets have been prepared for production."));
      console.log(chalk.green(`Assets can be served from the /assets route but it is recommended that you serve the generated \`build\` folder from a Content Delivery Network`));
    });
  }
};
