var path = require("path");
var webpack = require("webpack");
var process = require("process");
var nodemon = require("nodemon");
var chalk = require("chalk");
var webpackDevServer = require("webpack-dev-server");

var OUTPUT_PATH = path.join(process.cwd(), "build");
var OUTPUT_FILE = "main-bundle.js";
var PORT = 8080;
var THUMBS_UP_EMOJI = "\uD83D\uDC4D";

const paths = [
    process.cwd(),
    path.join(__dirname, "../../"),
    path.join(__dirname, "../../node_modules/")
];
var compiler = webpack({
    resolve: {
        extensions: ["", ".js", ".css"],
        root: paths
    },
    entry: {
        "main": [
            "webpack-dev-server/client?http://localhost:" + PORT,
            "webpack/hot/dev-server",
            path.join(__dirname, "../entrypoints/main.js")
        ]
    },
    output: {
        path: OUTPUT_PATH,
        filename: OUTPUT_FILE,
        publicPath: "http://localhost:" + PORT + "/"
    },
    plugins: [
        new webpack.NoErrorsPlugin(),
        new webpack.HotModuleReplacementPlugin()
    ],
    module: {
        loaders: [
            {
                test: /\.js$/,
                loaders: ["react-hot", "babel-loader"],
                exclude: /node_modules/
            }
        ]
    }
});

module.exports = function () {
    var watching = false;
    var fullOutputFilePath = path.join(OUTPUT_PATH, OUTPUT_FILE);
    compiler.watch({}, function (error, stats) {
        var jsonStats = stats.toJson();
        if (jsonStats.errors.length > 0 || error) {
            console.log("ERROR COMPILING", error, jsonStats.errors);
            process.exit();
            return;
        }

        if (!watching) {
            // @TODO render the server stuff here
            //watching = true;
            //console.log("nodemon now watching '" + fullOutputFilePath + "'");
            //nodemon(fullOutputFilePath);
        }

        console.log(chalk.green("New Build Ready " + THUMBS_UP_EMOJI));
    });

    var server = new webpackDevServer(compiler, {
        noInfo: true,
        hot: true
    });
    server.listen(PORT);
    console.log("Static server listening on " + chalk.cyan("http://localhost:" + PORT));
};

