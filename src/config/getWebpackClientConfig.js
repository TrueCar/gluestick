const path = require("path");
const webpack = require("webpack");
const WebpackIsomorphicToolsPlugin = require("webpack-isomorphic-tools/plugin");

const buildWebpackEntries = require("../lib/buildWebpackEntries").default;
const detectEnvironmentVariables = require("../lib/detectEnvironmentVariables");

const getWebpackAdditions = require("../lib/getWebpackAdditions").default;
const {
  additionalLoaders,
  additionalPreLoaders,
  additionalExternals,
  vendor,
  plugins
} = getWebpackAdditions();

const webpackSharedConfig = require("./webpack-shared-config");


const OUTPUT_FILE = "app.bundle.js";


export function getExposedEnvironmentVariables(config) {
  const exposedEnvironmentVariables = {};

  // The config is consumed on both the server side and the client side.
  // However, we want developers to have access to environment
  // variables in there so they can override defaults with an environment
  // variable. For that reason we are going to perform static analysis on that
  // file to determine all of the environment variables that are used in that
  // file and make sure that webpack makes those available in the application.
  const configEnvVariables = detectEnvironmentVariables(config);
  configEnvVariables.push("NODE_ENV");
  configEnvVariables.forEach((v) => {
    exposedEnvironmentVariables[v] = JSON.stringify(process.env[v]);
  });

  return exposedEnvironmentVariables;
}

export function getEnvironmentPlugins(isProduction) {
  const webpackIsomorphicToolsPlugin = new WebpackIsomorphicToolsPlugin(require("../config/webpack-isomorphic-tools-config"))
  .development(!isProduction);

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

  return environmentPlugins;
}

export default function (appRoot, appConfigFilePath, isProduction) {
  const config = require(appConfigFilePath).default;
  return {
    context: appRoot,
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
      path: path.join(appRoot, "build"),
      filename: `[name]-${OUTPUT_FILE}`,
      chunkFilename: `[name]-chunk-${OUTPUT_FILE}`,
      publicPath: config.assetPath,
    },
    plugins: [
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.OccurenceOrderPlugin(),
      new webpack.NoErrorsPlugin(),
      new webpack.DefinePlugin({
        "process.env": getExposedEnvironmentVariables(appConfigFilePath)
      }),

      // Make it so *.server.js files return empty function in client
      new webpack.NormalModuleReplacementPlugin(/\.server(\.js)?$/, () => {}),

      new webpack.optimize.CommonsChunkPlugin("vendor", "vendor.bundle.js"),
      new webpack.optimize.CommonsChunkPlugin("commons", "commons.bundle.js"),
      new webpack.optimize.AggressiveMergingPlugin()
    ].concat(getEnvironmentPlugins(), webpackSharedConfig.plugins, plugins),
    resolve: {
      ...webpackSharedConfig.resolve
    },
    externals: {
      ...additionalExternals
    }
  };

}
