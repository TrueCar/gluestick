var path = require("path");
var webpack = require("webpack");
var process = require("process");
var nodemon = require("nodemon");
var chalk = require("chalk");
var express = require("express");
var proxy = require("express-http-proxy");

var PORT = 8888;
var OUTPUT_PATH = path.join(process.cwd(), "build");
var OUTPUT_FILE = "main-bundle.js";
var PUBLIC_PATH = "http://localhost:" + PORT + "/";
var THUMBS_UP_EMOJI = "\uD83D\uDC4D";

process.env.NODE_PATH = path.join(__dirname, "../..");

var compiler = webpack({
    devtool: "eval",
    resolve: {
        extensions: ["", ".js", ".css"]
    },
    entry: {
        "main": [
            "webpack-hot-middleware/client",
            path.join(process.cwd(), "src/entrypoints/client.js")
        ]
    },
    output: {
        path: OUTPUT_PATH,
        filename: OUTPUT_FILE,
        publicPath: PUBLIC_PATH
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),
        new webpack.DefinePlugin({
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
                    path.join(process.cwd(), "src"),
                    path.join(__dirname, "../shared")
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

