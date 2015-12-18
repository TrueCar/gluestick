var express = require("express");

var WebpackIsomorphicTools = require("webpack-isomorphic-tools");
var projectBasePath = process.cwd();

var PORT = 8880;

module.exports = function () {
    global.webpackIsomorphicTools = new WebpackIsomorphicTools(require("../../webpack-isomorphic-tools-configuration"))
        .development(process.NODE_ENV !== "production")
        .server(process.cwd(), function () {
            var app = express();
            var serverRequestHandler = require("../lib/server-request-handler");

            // @TODO do better job of settings this up for production environment, we probably
            // only want to serve assets in dev mode and lean on a CDN in production
            app.use("/assets", express.static("assets"));

            app.use(serverRequestHandler);
            app.listen(PORT);
            console.log("Backend proxy running on " + PORT);
        });
};

