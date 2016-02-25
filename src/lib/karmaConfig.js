var path = require("path");
var process = require("process");
var shared = require("./shared");
var webpack = require("webpack");
var WebpackIsomorphicToolsPlugin = require("webpack-isomorphic-tools/plugin");
var getWebpackAdditions = require("../lib/get-webpack-additions");
var { additionalLoaders, additionalPreLoaders } = getWebpackAdditions();

var PORT = 9876;
var CWD = process.cwd();

var webpackIsomorphicToolsPlugin = new WebpackIsomorphicToolsPlugin(require('../lib/webpack-isomorphic-tools-configuration')).development(true);

const preprocessors = {};
const helperPath = path.resolve(__dirname, "./test-helper.js");
preprocessors[helperPath] = ["webpack", "sourcemap"];

export default {
  browsers: ["Chrome"],
  files: [
    helperPath
  ],
  frameworks: ["mocha", "chai", "sinon"],
  reporters: ["spec", "notify", "coverage"],
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
        },
        {
          test: /\.js$/, 
          loader: "isparta",
          exclude: /test/, 
          include: path.resolve(CWD, "src")
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
        "TEST_PATH": JSON.stringify(path.join(CWD, "test"))
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
  },
  coverageReporter: {
    reporters: [
      { 
        type: "html", 
        subdir: "html" 
      }
    ]
  }
};
