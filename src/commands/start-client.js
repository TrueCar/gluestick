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
var PUBLIC_PATH = "http://localhost:" + PORT + "/assets/";

var webpackIsomorphicToolsPlugin = new WebpackIsomorphicToolsPlugin(require('../../webpack-isomorphic-tools-configuration'))
                                        .development(process.env.NODE_ENV !== "production");

process.env.NODE_PATH = path.join(__dirname, "../..");
const isProduction = process.env.NODE_ENV === "production";

var entry = [
    path.join(__dirname, "../entrypoints/client.js")
];

var environmentPlugins = [];

if (isProduction) {
    environmentPlugins = environmentPlugins.concat([
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

// Include hot middleware in development mode only
if (!isProduction) {
    entry.unshift("webpack-hot-middleware/client");
}

var compiler = webpack({
    devtool: isProduction ? undefined : "eval",
    resolve: {
        extensions: ["", ".js", ".css"],
        alias: {
            "assets": path.join(process.cwd(), "assets")
        }
    },
    context: process.cwd(),
    entry: {
        "main": entry
    },
    output: {
        path: OUTPUT_PATH,
        filename: OUTPUT_FILE,
        publicPath: isProduction ? null : PUBLIC_PATH
    },
    plugins: [
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.NoErrorsPlugin(),
        new ExtractTextPlugin("[name].css"),
        new webpack.DefinePlugin({
            "__PATH_TO_ENTRY__": JSON.stringify(path.join(process.cwd(), "src/config/.entry")),
            "process.env": {
                "NODE_ENV": JSON.stringify(process.env.NODE_ENV)
            }
        })
    ].concat(environmentPlugins),
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
                loader: ExtractTextPlugin.extract("style", "css!sass")
            },
            {
                test: webpackIsomorphicToolsPlugin.regular_expression("json"),
                loader: "json-loader"
            }
        ]
    }
});

module.exports = function (buildOnly) {
    if (!buildOnly && !isProduction) {
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
    }
    else {
        console.log(chalk.yellow("Bundling assets…"));
        compiler.run(() => {
            console.log(chalk.green("Assets have been prepared for production."));
            console.log(chalk.green(`Assets can be served from the /assets route but it is recommended that you serve the generated \`build\` folder from a Content Delivery Network`));
        });
    }
};

