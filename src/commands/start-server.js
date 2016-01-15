var express = require("express");
var chalk = require("chalk");

var WebpackIsomorphicTools = require("webpack-isomorphic-tools");
var projectBasePath = process.cwd();

var isProduction = process.env.NODE_ENV === "production";

var PORT = isProduction ? 8888 : 8880;

module.exports = function () {
  global.webpackIsomorphicTools = new WebpackIsomorphicTools(require("../../webpack-isomorphic-tools-configuration"))
  .development(process.NODE_ENV !== "production")
  .server(process.cwd(), function () {
    var app = express();
    var serverRequestHandler = require("../lib/server-request-handler");

    if (isProduction) {
      app.use("/assets", express.static("build"));
      console.log(chalk.green("Server side rendering server running at http://localhost:" + PORT));

    }
    else {
      app.get("/gluestick-proxy-poll", function(req, res) { 
        // allow requests from our client side loading page
        res.header("Access-Control-Allow-Origin", "*"); 
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.status(200).json({up: true}); 
      });
      console.log("Server side rendering proxy running at http://localhost:" + PORT);
    }

    app.use(serverRequestHandler);
    app.listen(PORT);
  });
};

