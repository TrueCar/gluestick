var path = require("path");
var process = require("process");
var WebpackIsomorphicToolsPlugin = require("webpack-isomorphic-tools/plugin");
var ExtractTextPlugin = require("extract-text-webpack-plugin");

const isProduction = process.env.NODE_ENV === "production";
var webpackIsomorphicToolsPlugin = new WebpackIsomorphicToolsPlugin(require('../lib/webpack-isomorphic-tools-configuration'))
.development(process.env.NODE_ENV !== "production");

module.exports = {
  resolve: {
    extensions: ["", ".js", ".css"],
    alias: {
      "assets": path.join(process.cwd(), "assets")
    }
  },
  loaders: [
    {
      test: /\.js$/,
      loaders: ["babel-loader?stage=0&optional[]=runtime"],
      include: [
        path.join(process.cwd(), "Index.js"),
        path.join(process.cwd(), "src"),
        path.join(process.cwd(), "test"),
        path.join(__dirname, "../shared")
      ]
    },
    {
      test: webpackIsomorphicToolsPlugin.regular_expression("images"),
      loader: "file-loader?name=[name]-[hash].[ext]"
    },
    {
      test: webpackIsomorphicToolsPlugin.regular_expression("fonts"),
      loader: "file-loader?name=[name]-[hash].[ext]"
    },
    {
      test: webpackIsomorphicToolsPlugin.regular_expression("json"),
      loader: "json-loader"
    },
    {
      test: webpackIsomorphicToolsPlugin.regular_expression("styles"),
      loader: isProduction ? ExtractTextPlugin.extract("style", "css!sass") : "style!css!sass"
    }
  ],
  plugins: [
    new ExtractTextPlugin("[name].css"),
  ],
  preLoaders: []
};
