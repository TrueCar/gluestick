const path = require("path");
const process = require("process");
const shared = require("./shared");
const webpack = require("webpack");
const WebpackIsomorphicToolsPlugin = require("webpack-isomorphic-tools/plugin");
const getWebpackAdditions = require("../lib/get-webpack-additions").default;
const { additionalLoaders, additionalPreLoaders } = getWebpackAdditions();

const PORT = 9876;
const CWD = process.cwd();

const webpackIsomorphicToolsPlugin = new WebpackIsomorphicToolsPlugin(require("../lib/webpack-isomorphic-tools-configuration")).development(true);

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
      ].concat(shared.loaders).concat(
        // babel-istanbul must be defined after the babel loader
        {
          test: /\.js$/,
          loader: "babel-istanbul",
          exclude: /test/,
          include: path.resolve(CWD, "src")
        }
      ).concat(additionalLoaders),
      preLoaders: [
        // only place test specific preLoaders here
      ].concat(shared.preLoaders, additionalPreLoaders),
    },
    node: {
      fs: "empty"
    },
    plugins: [
      new webpack.DefinePlugin({
        "TEST_PATH": JSON.stringify(path.join(CWD, "test")),
        "SRC_PATH": JSON.stringify(path.join(CWD, "src"))
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
    },
    externals: {
      "react/lib/ExecutionEnvironment": true,
      "react/lib/ReactContext": true
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
