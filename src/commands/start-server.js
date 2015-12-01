require("babel-core/register")({stage: 0});
var fs = require("fs");
var path = require("path");
var express = require("express");
var chalk = require("chalk");
var app = express();
var renderToString = require("react-dom/server").renderToString;
var createElement = require("react").createElement;
var ReactRouter = require("react-router");
var match = ReactRouter.match;
var RoutingContext = ReactRouter.RoutingContext;

var Body = require("../shared/components/Body");
var head = require("../shared/components/head");

var PORT = 8880;
var OUTPUT_PATH = path.join(process.cwd(), "build");
var OUTPUT_FILE = "server-bundle.js";

module.exports = function () {
    var Index = require(path.join(process.cwd(), "Index"));
    var Main = require(path.join(process.cwd(), "src/Main"));
    var routes = require(path.join(process.cwd(), "src/config/routes"));

    // We always use the same request handler and we let React handle
    app.use(function (req, res) {
        match({routes: routes, location: req.path}, function (error, redirectLocation, renderProps) {
            if (error) {
                // @TODO custom 500 handling
                res.status(500).send(error.message);
            }
            else if (redirectLocation) {
                res.redirect(302, redirectLocation.pathname + redirectLocation.search);
            }
            else if (renderProps) {
                // If we have a matching route, set up a routing context so
                // that we render the proper page. On the client side, you
                // embed the router itself, on the server you embed a routing
                // context.
                // [https://github.com/rackt/react-router/blob/master/docs/guides/advanced/ServerRendering.md]
                var routingContext = createElement(RoutingContext, renderProps);

                // grab the main component which is capable of loading routes
                // and hot loading them if in development mode
                var radiumConfig = { userAgent: req.headers["user-agent"] };
                var main = createElement(Main, {routingContext: routingContext, radiumConfig: radiumConfig});

                // grab the react generated body stuff. This includes the
                // script tag that hooks up the client side react code.
                var body = createElement(Body, {html: renderToString(main)});

                // Grab the html from the project which is stored in the root
                // folder named Index.js. Pass the body and the head to that
                // component. `head` includes stuff that we want the server to
                // always add inside the <head> tag.
                //
                // Bundle it all up into a string, add the doctype and deliver
                res.status(200).send("<!DOCTYPE html>\n" + renderToString(createElement(Index, {body: body, head: head})));
            }
            else {
                // @TODO custom 404 handling
                res.status(404).send("Not Found");
            }
        });
    });

    app.listen(PORT);
    console.log("Backend proxy running on " + PORT);
};

