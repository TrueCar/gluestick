var express = require("express");

var serverRequestHandler = require("../lib/server-request-handler");

var app = express();
var PORT = 8880;

module.exports = function () {
    app.use(serverRequestHandler);
    app.listen(PORT);
    console.log("Backend proxy running on " + PORT);
};

