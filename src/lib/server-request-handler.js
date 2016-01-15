import chalk from "chalk";
import path from "path";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { fetchAllData } from "./route-helper";
import { match, RoutingContext, Route } from "react-router";

import prepareRoutesWithTransitionHooks from "./prepareRoutesWithTransitionHooks";
import serverErrorHandler from "./server-error-handler";
import Body from "../shared/components/Body";
import getHead from "../shared/components/getHead";

process.on("unhandledRejection", (reason, promise) => {
    console.log(chalk.red(reason), promise);
});

module.exports = async function (req, res) {
    try {
        const Index = require(path.join(process.cwd(), "Index"));
        const Entry = require(path.join(process.cwd(), "src/config/.entry"));
        const store = require(path.join(process.cwd(), "src/config/.store"))();
        const originalRoutes = require(path.join(process.cwd(), "src/config/routes"));
        const rawConfig = require(path.join(process.cwd(), "src/config/application"));
        const config = rawConfig[process.env.NODE_ENV] || rawConfig.development;
        const routes = prepareRoutesWithTransitionHooks(originalRoutes);
        match({routes: routes, location: req.path}, async (error, redirectLocation, renderProps) => {
            try {
                if (error) {
                    serverErrorHandler(req, res, error);
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
                    await fetchAllData(store, renderProps || {});
                    const routingContext = createElement(RoutingContext, renderProps);

                    // grab the main component which is capable of loading routes
                    // and hot loading them if in development mode
                    const radiumConfig = { userAgent: req.headers["user-agent"] };
                    const main = createElement(Entry, {store: store, routingContext: routingContext, config: config, radiumConfig: radiumConfig});

                    // grab the react generated body stuff. This includes the
                    // script tag that hooks up the client side react code.
                    const body = createElement(Body, {html: renderToString(main), config: config, initialState: store.getState()});
                    const head = getHead(config);

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
            }
            catch (error) {
                serverErrorHandler(req, res, error);
            }
        });
    }
    catch (error) {
        serverErrorHandler(req, res, error);
    }
};

