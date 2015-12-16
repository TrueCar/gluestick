"use strict";

var karma = require("karma");
var webpack = require("webpack");
var process = require("process");
var path = require("path");
var Server = karma.Server;
var runner = karma.runner;

var PORT = 9876;
var CWD = process.cwd();

var preprocessors = {};
var helperPath = path.resolve(__dirname, "../lib/test-helper.js");
preprocessors[helperPath] = ["webpack", "sourcemap"];

var config = {
    port: PORT,
    browsers: ["Chrome"],
    reporters: ["spec", "notify"],
    frameworks: ["mocha", "chai", "sinon"],
    files: [helperPath],
    preprocessors: preprocessors,
    webpack: {
        devtool: "inline-source-map",
        module: {
            loaders: [{
                test: /\.js$/,
                loader: "babel?stage=0&optional[]=runtime",
                exclude: /node_modules/
            }]
        },
        plugins: [new webpack.DefinePlugin({
            "TEST_PATH": JSON.stringify(path.join(process.cwd(), "test"))
        })],
        resolve: {
            extensions: ["", ".js", ".css"],
            alias: {
                assets: path.resolve(CWD, "assets"),
                colors: path.resolve(CWD, "src/config/colors")
            },
            root: [path.resolve(CWD, "node_modules"), path.resolve(CWD, "src"), path.resolve(CWD, "test")]
        },
        node: {
            fs: "empty"
        }
    },
    webpackServer: {
        noInfo: true
    }
};

module.exports = function () {
    var server = new Server(config);
    server.start();
    server.on("browsers_ready", function () {
        runner.run(config, function () {});
    });
};