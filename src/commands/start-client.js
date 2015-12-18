var path = require("path");
var webpack = require("webpack");
var process = require("process");
var chalk = require("chalk");
var express = require("express");
var proxy = require("express-http-proxy");
var WebpackIsomorphicToolsPlugin = require("webpack-isomorphic-tools/plugin");
var ExtractTextPlugin = require("extract-text-webpack-plugin");

var PORT = 8888;
var OUTPUT_PATH = path.join(process.cwd(), "build");
var OUTPUT_FILE = "main-bundle.js";
var PUBLIC_PATH = "http://localhost:" + PORT + "/";

var webpackIsomorphicToolsPlugin = new WebpackIsomorphicToolsPlugin(require('../../webpack-isomorphic-tools-configuration'))
                                        .development(process.env.NODE_ENV !== "production");

process.env.NODE_PATH = path.join(__dirname, "../..");

var compiler = webpack({
    devtool: "eval",
    resolve: {
        extensions: ["", ".js", ".css"],
        alias: {
            "assets": path.join(process.cwd(), "assets")
        }
    },
    context: process.cwd(),
    entry: {
        "main": [
            "webpack-hot-middleware/client",
            path.join(__dirname, "../entrypoints/client.js")
        ]
    },
    output: {
        path: OUTPUT_PATH,
        filename: OUTPUT_FILE,
        publicPath: PUBLIC_PATH
    },
    plugins: [
        webpackIsomorphicToolsPlugin,
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.OccurenceOrderPlugin(),
        // @TODO: add uglifyjs to production mode
        //new webpack.optimize.UglifyJsPlugin({
            //compress: {
                //warnings: false
            //}
        //}),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
        new ExtractTextPlugin("[name].css"),
        new webpack.DefinePlugin({
            "__PATH_TO_ENTRY__": JSON.stringify(path.join(process.cwd(), "src/config/.entry")),
            "process.env": {
                "NODE_ENV": JSON.stringify("development")
            }
        })
    ],
    module: {
        loaders: [
            {
                test: /\.js$/,
                loaders: ["babel-loader?stage=0"],
                include: [
                    path.join(process.cwd(), "Index.js"),
                    path.join(process.cwd(), "src"),
                    path.join(__dirname, "../shared")
                ]
            },
            {
                test: webpackIsomorphicToolsPlugin.regular_expression("images"),
                loader: "file-loader",
                include: [
                    path.join(process.cwd(), "assets"),
                    path.join(__dirname, "../shared/assets")
                ]
            },
            {
                test: webpackIsomorphicToolsPlugin.regular_expression("fonts"),
                loader: "file-loader",
                include: [
                    path.join(process.cwd(), "assets"),
                    path.join(__dirname, "../shared/assets")
                ]
            },
            {
                test: webpackIsomorphicToolsPlugin.regular_expression("styles"),
                loader: ExtractTextPlugin.extract("style", "css!sass"),
                include: [
                    path.join(process.cwd(), "assets"),
                    path.join(__dirname, "../shared/assets")
                ]
            }
        ]
    }
});

module.exports = function () {
    var app = express();
    app.use(require("webpack-dev-middleware")(compiler, {
        noInfo: true,
        publicPath: PUBLIC_PATH
    }));
    app.use(require("webpack-hot-middleware")(compiler));
    app.use(proxy("localhost:8880", {
        forwardPath: function (req, res) {
            return require("url").parse(req.url).path;
        }
    }));
    app.listen(PORT, "localhost", function (error) {
        if (error) {
            console.log(error);
            return;
        }

        console.log(chalk.green("Server running on http://localhost:" + PORT));
    });
};

