// Webpack configuration that is shared between the client and tests
import path from "path";
import process from "process";
import HappyPack from "happypack";
import { GLUESTICK_ADDON_DIR_REGEX } from "./vars";

const WebpackIsomorphicToolsPlugin = require("webpack-isomorphic-tools/plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

const isProduction = process.env.NODE_ENV === "production";
const webpackIsomorphicToolsConfig = require("../config/webpack-isomorphic-tools-config");

const webpackIsomorphicToolsPlugin = new WebpackIsomorphicToolsPlugin(webpackIsomorphicToolsConfig)
  .development(process.env.NODE_ENV !== "production");

module.exports = {
  resolve: {
    extensions: ["", ".js", ".css", ".json"],
    alias: {
      // default alias are defined in src/config/webpack-isomorphic-tools-config.js
      ...webpackIsomorphicToolsConfig.alias
    }
  },
  loaders: [
    {
      test: /\.js$/,
      loader: path.resolve(__dirname, "../../node_modules/happypack/loader.js"),
      query: {
        id: "babel",
      },
      include: [
        path.join(process.cwd(), "Index.js"),
        path.join(process.cwd(), "src"),
        path.join(process.cwd(), "test"),
        GLUESTICK_ADDON_DIR_REGEX
      ]
    },
    {
      test: webpackIsomorphicToolsPlugin.regular_expression("images"),
      loaders: [
        "file-loader?name=[name]-[hash].[ext]",
        "image-webpack"
      ]
    },
    {
      test: webpackIsomorphicToolsPlugin.regular_expression("fonts"),
      loader: path.resolve(__dirname, "../../node_modules/happypack/loader.js"),
      query: {
        id: "fonts",
      },
    },
    {
      test: webpackIsomorphicToolsPlugin.regular_expression("styles"),
      loader: isProduction ? ExtractTextPlugin.extract("style", "css!sass") : "style!css!sass"
    },
    {
      test: webpackIsomorphicToolsPlugin.regular_expression("json"),
      loader: "json"
    }
  ],
  plugins: [
    new ExtractTextPlugin("[name]-[chunkhash].css"),
    new OptimizeCSSAssetsPlugin(),
    new HappyPack({
      id: "babel",
      loaders: ["babel-loader?presets[]=react&presets[]=es2015&presets[]=stage-0&plugins[]=transform-decorators-legacy"],
      threads: 4,
    }),
  ],
  preLoaders: []
};
