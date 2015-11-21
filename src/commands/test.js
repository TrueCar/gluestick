var path = require("path");
var webpack = require("webpack");
var process = require("process");
var nodemon = require("nodemon");

var OUTPUT_PATH = path.join(process.cwd(), "build");
var OUTPUT_FILE = "test-bundle.js";

const paths = [
    process.cwd(),
    path.join(__dirname, "../../")
];
var compiler = webpack({
    resolve: {
        extensions: ["", ".js", ".css"],
        root: paths
    },
    entry: {
        "test": path.join(__dirname, "../entrypoints/test")
    },
    output: {
        path: OUTPUT_PATH,
        filename: OUTPUT_FILE
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: "babel-loader",
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

        console.log("new script compiled");
        if (!watching) {
            watching = true;
            console.log("nodemon now watching '" + fullOutputFilePath + "'");
            nodemon(fullOutputFilePath);
        }
    });
};

