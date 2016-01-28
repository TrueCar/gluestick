var karma = require("karma");
var webpack = require("webpack");
var process = require("process");
var path = require("path");
var Server = karma.Server;
var runner = karma.runner;
var WebpackIsomorphicToolsPlugin = require("webpack-isomorphic-tools/plugin");
var shared = require("./shared");
var getWebpackAdditions = require("../lib/get-webpack-additions");
var { additionalLoaders, additionalPreLoaders } = getWebpackAdditions();

var PORT = 9876;
var CWD = process.cwd();

const preprocessors = {};
const helperPath = path.resolve(__dirname, "../lib/test-helper.js");
preprocessors[helperPath] = ["webpack", "sourcemap"];

var webpackIsomorphicToolsPlugin = new WebpackIsomorphicToolsPlugin(require('../../webpack-isomorphic-tools-configuration')).development(true);

const config = {
  browsers: ["Chrome"],
  files: [
    helperPath
  ],
  frameworks: ["mocha", "chai", "sinon"],
  reporters: ["spec", "notify"],
  port: PORT,
  preprocessors: preprocessors,
  webpack: {
    devtool: "inline-source-map",
    module: {
      loaders: [
        // only place test specific loaders here
        {
          test: webpackIsomorphicToolsPlugin.regular_expression("styles"),
          loader: "file-loader"
        }
      ].concat(shared.loaders, additionalLoaders),
      preLoaders: [
        // only place test specific preLoaders here
      ].concat(shared.preLoaders, additionalPreLoaders),
    },
    node: {
      fs: "empty"
    },
    plugins: [
      new webpack.DefinePlugin({
        "TEST_PATH": JSON.stringify(path.join(process.cwd(), "test"))
      })
    ].concat(shared.plugins),
    resolve: {
      ...shared.resolve,
      alias: {
        ...shared.resolve.alias,
        colors: path.resolve(CWD, "src/config/colors")
      },
      root: [
        path.resolve(CWD, "node_modules"),
        path.resolve(CWD, "src"),
        path.resolve(CWD, "test")
      ]
    }
  },
  webpackServer: {
    noInfo: true
  }
};

module.exports = function (options) {
  // override browser setting to use firefox instead of Chrome if specified
  if (options.firefox) {
    config.browsers = ["Firefox"];
  }

  const server = new Server(config);

  server.start();
  server.on("browsers_ready", function () {
    runner.run(config, () => {});
  });
};
