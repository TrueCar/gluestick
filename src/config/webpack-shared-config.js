// Webpack configuration that is shared between the client and tests
import path from "path";
import process from "process";
import { GLUESTICK_ADDON_DIR_REGEX } from "./vars";

const WebpackIsomorphicToolsPlugin = require("webpack-isomorphic-tools/plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const isProduction = process.env.NODE_ENV === "production";
const webpackIsomorphicToolsConfig = require("../config/webpack-isomorphic-tools-config");

const webpackIsomorphicToolsPlugin = new WebpackIsomorphicToolsPlugin(webpackIsomorphicToolsConfig)
  .development(process.env.NODE_ENV !== "production");

module.exports = {
  resolve: {
    extensions: [".js", ".css", ".json"],
    alias: {
      // default alias are defined in src/config/webpack-isomorphic-tools-config.js
      ...webpackIsomorphicToolsConfig.alias
    }
  },
  rules: [
    {
      test: /\.js$/,
      loader: "babel-loader",
      options: {
        plugins: [
          "transform-decorators-legacy"
        ],
        presets: [
          ["es2015", { "modules": false }],
          "stage-0",
          "react"
        ]
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
        "image-webpack-loader"
      ]
    },
    {
      test: webpackIsomorphicToolsPlugin.regular_expression("fonts"),
      loader: "file-loader?name=[name]-[hash].[ext]"
    },
    {
      test: webpackIsomorphicToolsPlugin.regular_expression("styles"),
      loader: isProduction ? ExtractTextPlugin.extract({
        fallbackLoader: "style-loader",
        loader: [
          "css-loader",
          "sass-loader?sourceMap",
        ],
      }) : [
        "style-loader",
        "css-loader",
        "sass-loader"
      ],
    },
  ],
  plugins: [
    new ExtractTextPlugin("[name]-[chunkhash].css"),
    new OptimizeCSSAssetsPlugin()
  ],
};
