var fs = require("fs");
var path = require("path");
var express = require("express");
var chalk = require("chalk");
var app = express();

var PORT = 8880;
var OUTPUT_PATH = path.join(process.cwd(), "build");
var OUTPUT_FILE = "server-bundle.js";


//var babelrc = fs.readFileSync("./.babelrc");
//var config;

//try {
    //config = JSON.parse(babelrc);
//} catch (error) {
    //console.log("Error parsing .babelrc");
//}

require("babel-core/register")({stage: 0});

module.exports = function () {

    // @TODO
    // In order to get main loaded in properly without hot module replacement
    // kicking in, it requires the node environment to be production. However,
    // if we change it to production, then the client side stuff gets messed
    // up. We need to figure out how to require main without hmr without
    // tweaking the NODE_ENV
    //process.env["NODE_ENV"] = "production";
    //var main = require(path.join(process.cwd(), "src/main"));

    app.get("*", function (req, res) {
        res.sendFile(path.join(process.cwd(), "index.html"));
    });
    app.listen(PORT);
    console.log("Backend proxy running on " + PORT);
};

