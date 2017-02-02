const path = require("path");
const process = require("process");
const webpack = require("webpack");
const WebpackIsomorphicToolsPlugin = require("webpack-isomorphic-tools/plugin");
const webpackSharedConfig = require("./webpack-shared-config");
const getWebpackAdditions = require("../lib/getWebpackAdditions").default;
const { additionalLoaders, additionalPreLoaders } = getWebpackAdditions();

const PORT = 9876;
const CWD = process.cwd();

const webpackIsomorphicToolsPlugin = new WebpackIsomorphicToolsPlugin(require("./webpack-isomorphic-tools-config")).development(true);

const preprocessors = {};
const helperPath = path.resolve(__dirname, "../lib/testHelperKarma.js");
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
      ].concat(webpackSharedConfig.loaders).concat(
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
      ].concat(webpackSharedConfig.preLoaders, additionalPreLoaders),
    },
    node: {
      fs: "empty"
    },
    plugins: [
      new webpack.DefinePlugin({
        "TEST_PATH": JSON.stringify(path.join(CWD, "test")),
        "SRC_PATH": JSON.stringify(path.join(CWD, "src"))
      })
    ].concat(webpackSharedConfig.plugins),
    resolve: {
      ...webpackSharedConfig.resolve,
      alias: {
        ...webpackSharedConfig.resolve.alias,
        colors: path.resolve(CWD, "src/config/colors")
      },
      root: [
        path.resolve(CWD, "node_modules"),
        path.resolve(CWD, "src"),
        path.resolve(CWD, "test")
      ]
    },
    externals: {
      "react/addons": true,
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
      },
      {
        type: "cobertura",
        subdir: "xml"
      }
    ]
  }
};
