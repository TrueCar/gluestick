var karma = require("karma");
var webpack = require("webpack");
var process = require("process");
var path = require("path");
var Server = karma.Server;
var runner = karma.runner;
var WebpackIsomorphicToolsPlugin = require("webpack-isomorphic-tools/plugin");

var PORT = 9876;
var CWD = process.cwd();

const preprocessors = {};
const helperPath = path.resolve(__dirname, "../lib/test-helper.js");
preprocessors[helperPath] = ["webpack", "sourcemap"];

var webpackIsomorphicToolsPlugin = new WebpackIsomorphicToolsPlugin(require('../../webpack-isomorphic-tools-configuration')).development(true);

// @TODO: start-client and this file share a lot of copy/paste code. We need to
// clean this up in the meantime tests were completely broken so this is being
// rushed in
const config = {
    port: PORT,
    browsers: ["Chrome"],
    reporters: ["spec", "notify"],
    frameworks: ["mocha", "chai", "sinon"],
    files: [
        helperPath
    ],
    preprocessors: preprocessors,
    webpack: {
        devtool: "inline-source-map",
        module: {
            loaders: [
                {
                    test: /\.js$/,
                    loader: "babel?stage=0&optional[]=runtime",
                    exclude: /node_modules/
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
                    loader: "file-loader"
                },
                {
                    test: webpackIsomorphicToolsPlugin.regular_expression("json"),
                    loader: "json-loader"
                }
            ]
        },
        plugins: [
            new webpack.DefinePlugin({
                "TEST_PATH": JSON.stringify(path.join(process.cwd(), "test"))
            })
        ],
        resolve: {
            extensions: ["", ".js", ".css"],
            alias: {
                assets: path.resolve(CWD, "assets"),
                colors: path.resolve(CWD, "src/config/colors")
            },
            root: [
                path.resolve(CWD, "node_modules"),
                path.resolve(CWD, "src"),
                path.resolve(CWD, "test")
            ]
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
        runner.run(config, () => {});
    });
};

