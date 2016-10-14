/*global webpackIsomorphicTools*/
import path from "path";
import React from "react";
import LRU from "lru-cache";
import Oy from "oy-vey";
import { renderToString, renderToStaticMarkup } from "react-dom-stream/server";
import LRURenderCache from "react-dom-stream/lru-render-cache";
import { renderToStaticMarkup as renderToStaticMarkupEmail } from "react-dom/server";
import { match, RouterContext } from "react-router";
import {
    runBeforeRoutes as _runBeforeRoutes,
    prepareRoutesWithTransitionHooks,
    ROUTE_NAME_404_NOT_FOUND
} from "gluestick-shared";

import _streamResponse from "./streamResponse";
import _showHelpText, { MISSING_404_TEXT } from "./helpText";
import _getHeaders from "./getHeaders";
import _getHead from "./getHead";
import Body from "./Body";
import { PassThrough } from "stream";
import { getLogger } from "./logger";
const _logger = getLogger();

const _Entry = require(path.join(process.cwd(), "src/config/.entry")).default;
const HTML5 = "<!DOCTYPE html>";

const isProduction = process.env.NODE_ENV === "production";

const componentCache = LRURenderCache({max: isProduction ? 500 * 1024 * 1024 : 0});

const DEFAULT_CACHE_TTL = 5 * 1000;
const _cache = LRU({
  max: 50,
  maxAge: DEFAULT_CACHE_TTL
});

export function getCacheKey ({hostname, url}) {
  return `h:${hostname} u:${url}`;
}

export function renderCachedResponse (req, res, cache=_cache, streamResponse=_streamResponse) {
  const key = getCacheKey(req);
  const result = cache.get(key);
  if (result) {
    streamResponse(req, res, result);
    return true;
  }

  return false;
}

export function  matchRoute (req, getRoutes, store) {
  return new Promise((resolve, reject) => {
    const routes = prepareRoutesWithTransitionHooks(getRoutes(store));
    match({routes: routes, location: req.url}, async (error, redirectLocation, renderProps) => {
      if (error) {
        reject(error);
        return;
      }

      resolve({redirectLocation, renderProps});
    });
  });
}

export function redirect (res, redirectLocation) {
  res.redirect(302, redirectLocation.pathname + redirectLocation.search);
}

export function renderNotFound (res, showHelpText=_showHelpText) {
  // This is only hit if there is no 404 handler in the react routes. A
  // not found handler is included by default in new projects.
  showHelpText(MISSING_404_TEXT);
  res.status(404).send("Not Found");
}

export function runPreRenderHooks (req, renderProps, store, runBeforeRoutes=_runBeforeRoutes) {
  return runBeforeRoutes(store, renderProps || {}, {isServer: true, request: req});
}

export function getCurrentRoute (renderProps) {
  return renderProps.routes[renderProps.routes.length - 1];
}

export function getStatusCode (state, currentRoute) {
  let status = 200;

  // Check if status code was set in redux
  if (state._gluestick.hasOwnProperty("statusCode") && typeof(state._gluestick.statusCode) !== "undefined") {
    status = state._gluestick.statusCode;
  }

  // Check if this is the 404 route
  // @deprecate in favor of route level status
  else if (currentRoute.name === ROUTE_NAME_404_NOT_FOUND) {
    status = 404;
  }

  // Check for something like <Route status={404} />
  else if (currentRoute.status) {
    status = currentRoute.status;
  }

  return status;
}

export function setHeaders (res, currentRoute, getHeaders=_getHeaders) {
  const headers = getHeaders(currentRoute);
  if (headers) {
    res.set(headers);
  }
}

export function prepareOutput(req, {Index, store, getRoutes, fileName}, renderProps, config, envVariables, getHead=_getHead, Entry=_Entry) {
  const routerContext = <RouterContext {...renderProps} />;

  const radiumConfig = { userAgent: req.headers["user-agent"] };

  const main = (
    <Entry
      store={store}
      routerContext={routerContext}
      config={config}
      radiumConfig={radiumConfig}
      getRoutes={getRoutes}
    />
  );

  // gather attributes that were included on the route in order to
  // determine whether to render as an e-mail or not
  const routeAttrs = getEmailAttributes(renderProps.routes);
  const isEmail = routeAttrs.email;
  const reactRenderFunc = isEmail ? renderToStaticMarkupEmail : renderToString;

  // grab the react generated body stuff. This includes the
  // script tag that hooks up the client side react code.
  const currentState = store.getState();
  const body = (
    <Body
      html={reactRenderFunc(main, {cache: componentCache})}
      initialState={currentState}
      isEmail={isEmail}
      envVariables={envVariables}
    />
  );
  const head = isEmail ? null : getHead(config, fileName, webpackIsomorphicTools.assets()); // eslint-disable-line webpackIsomorphicTools

  // Grab the html from the project which is stored in the root
  // folder named Index.js. Pass the body and the head to that
  // component. `head` includes stuff that we want the server to
  // always add inside the <head> tag.
  //
  // Bundle it all up into a string, add the doctype and deliver
  const rootElement = <Index body={body} head={head} req={req} />;

  let responseStream, responseString;
  if (isEmail) {
    const generateCustomTemplate = ({bodyContent}) => { return `${bodyContent}`; };
    responseString = Oy.renderTemplate(rootElement, {}, generateCustomTemplate);
  }
  else {
    responseStream = renderToStaticMarkup(rootElement);
  }

  return {
    responseStream,
    responseString
  };
}

export function cacheAndRender (req, res, currentRoute, status, output, cache=_cache, streamResponse=_streamResponse, logger=_logger) {
  const cachePass = new PassThrough();
  const { responseStream, responseString } = output;
  const cacheKey = getCacheKey(req);

  const routeAttrs = getEmailAttributes(currentRoute);

  let cachedResponse = "";
  cachePass.on("data", (chunk) => {
    cachedResponse += chunk;
  });
  cachePass.on("end", () => {
    // If caching has been enabled for this route, cache response for
    // next time it is requested
    if (currentRoute.cache && isProduction) {
      const cacheTTL = currentRoute.cacheTTL * 1000 || DEFAULT_CACHE_TTL;
      logger.debug(`Caching response for ${cacheKey} - ${cacheTTL}`);
      cache.set(cacheKey, {
        status,
        responseString: cachedResponse,
        docType: routeAttrs.docType
      }, cacheTTL);
    }
  });

  streamResponse(req, res, {
    status,
    docType: routeAttrs.docType,
    responseStream: responseStream && responseStream.pipe(cachePass),
    responseString
  });
}

export function getEmailAttributes (currentRoute) {
  const email = currentRoute.email || false;
  const docType = currentRoute.docType || HTML5;
  return { email, docType };
}

