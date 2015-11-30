var fs = require("fs");
var path = require("path");
var express = require("express");
var chalk = require("chalk");
var app = express();

var PORT = 8880;
var OUTPUT_PATH = path.join(process.cwd(), "build");
var OUTPUT_FILE = "server-bundle.js";

require("babel-core/register")({stage: 0});

module.exports = function () {

    var main = require(path.join(process.cwd(), "src/main"));

    app.get("*", function (req, res) {
        res.sendFile(path.join(process.cwd(), "index.html"));
    });
    app.listen(PORT);
    console.log("Backend proxy running on " + PORT);
};

