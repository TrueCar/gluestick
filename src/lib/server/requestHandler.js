/*global webpackIsomorphicTools*/
import path from "path";
import { createElement } from "react";
import { renderToString, renderToStaticMarkup } from "react-dom/server";

import {
  runBeforeRoutes,
  prepareRoutesWithTransitionHooks,
  ROUTE_NAME_404_NOT_FOUND
} from "gluestick-shared";

import { match, RouterContext } from "react-router";
import errorHandler from "./errorHandler";
import Body from "./Body";
import getHead from "./getHead";
import getRenderRequirementsFromEntrypoints from "./getRenderRequirementsFromEntrypoints";

// E-mail support
import Oy from "oy-vey";
const HTML5 = "<!DOCTYPE html>";

import { getLogger } from "./logger";
const logger = getLogger();
import showHelpText, { MISSING_404_TEXT } from "./helpText";


process.on("unhandledRejection", (reason) => {
  const message = reason.message || reason.statusText || reason;
  logger.error(reason, "Unhandled promise rejection:", message);
});

module.exports = async function (req, res) {
  try {

    // Forward all request headers from the browser into http requests made by node
    const config = require(path.join(process.cwd(), "src", "config", "application")).default;
    const Entry = require(path.join(process.cwd(), "src/config/.entry")).default;
    const { Index, store, getRoutes, fileName } = getRenderRequirementsFromEntrypoints(req, res, config);

    const routes = prepareRoutesWithTransitionHooks(getRoutes(store));

    match({routes: routes, location: req.path}, async (error, redirectLocation, renderProps) => {
      try {
        if (error) {
          errorHandler(req, res, error);
        }
        else if (redirectLocation) {
          res.redirect(302, redirectLocation.pathname + redirectLocation.search);
        }
        else if (renderProps) {

          // If we have a matching route, set up a routing context so
          // that we render the proper page. On the client side, you
          // embed the router itself, on the server you embed a routing
          // context.
          // [https://github.com/reactjs/react-router/blob/master/docs/guides/ServerRendering.md]
          await runBeforeRoutes(store, renderProps || {}, {isServer: true, request: req});

          const routerContext = createElement(RouterContext, renderProps);

          // grab the main component which is capable of loading routes
          // and hot loading them if in development mode
          const radiumConfig = { userAgent: req.headers["user-agent"] };

          const main = createElement(Entry, {store, routerContext, config, radiumConfig, getRoutes});

          // gather attributes that were included on the route in order to
          // determine whether to render as an e-mail or not
          const routeAttrs = getEmailAttributes(renderProps.routes);
          const isEmail = routeAttrs.email;
          const reactRenderFunc = isEmail ? renderToStaticMarkup : renderToString;

          // grab the react generated body stuff. This includes the
          // script tag that hooks up the client side react code.
          const currentState = store.getState();
          const body = createElement(Body, {html: reactRenderFunc(main), entryPoint: fileName, config: config, initialState: currentState, isEmail: isEmail});
          const head = isEmail ? null : getHead(config, fileName, webpackIsomorphicTools.assets()); // eslint-disable-line webpackIsomorphicTools


          // Grab the html from the project which is stored in the root
          // folder named Index.js. Pass the body and the head to that
          // component. `head` includes stuff that we want the server to
          // always add inside the <head> tag.
          //
          // Bundle it all up into a string, add the doctype and deliver
          const rootElement = createElement(Index, {body: body, head: head});

          // Set status code
          if (renderProps.routes[renderProps.routes.length - 1].name === ROUTE_NAME_404_NOT_FOUND) {
            res.status(404);
          }
          else {
            // Use the error's status code that was set on GlueStick's internal
            // state object if one exists
            const errorStatus = getErrorStatusCode(currentState);
            if (errorStatus !== null) {
              res.status(errorStatus);
            }
            else {
              res.status(200);
            }
          }

          if (isEmail) {
            const generateCustomTemplate = ({bodyContent}) => { return `${bodyContent}`; };
            res.send(routeAttrs.docType + "\n" + Oy.renderTemplate(rootElement, {}, generateCustomTemplate));
          }
          else {
            res.send(routeAttrs.docType + "\n" + reactRenderFunc(rootElement));
          }
        }
        else {
          // This is only hit if there is no 404 handler in the react routes. A
          // not found handler is included by default in new projects.
          showHelpText(MISSING_404_TEXT);
          res.status(404).send("Not Found");
        }
      }
      catch (error) {
        // Always return a 500 for exceptions
        errorHandler(req, res, error);
      }
    });
  }
  catch (error) {
    errorHandler(req, res, error);
  }
};

function getEmailAttributes (routes) {
  const lastRoute = routes[routes.length - 1];
  const email = lastRoute.email || false;
  const docType = lastRoute.docType || HTML5;
  return { email, docType };
}

function getErrorStatusCode (state) {
  if (state._gluestick.hasOwnProperty("statusCode")) {
    return state._gluestick.statusCode;
  }
  return null;
}

