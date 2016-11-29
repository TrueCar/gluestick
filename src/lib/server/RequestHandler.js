/*global webpackIsomorphicTools*/
import path from "path";
import _SSRCaching from "electrode-react-ssr-caching";
import React from "react";
import LRU from "lru-cache";
import Oy from "oy-vey";
import { renderToString, renderToStaticMarkup } from "react-dom/server";
import { match, RouterContext } from "react-router";
import {
    runBeforeRoutes as _runBeforeRoutes,
    prepareRoutesWithTransitionHooks,
    ROUTE_NAME_404_NOT_FOUND
} from "gluestick-shared";

import _streamResponse from "./streamResponse";
import _showHelpText, { MISSING_404_TEXT } from "./helpText";
import getHeaders from "./getHeaders";
import _getHead from "./getHead";
import Body from "./Body";
import { getLogger } from "./logger";

const _logger = getLogger();

let _Entry;
/**
 * We don't want to load Entry until the test runs when we are testing
 * because the tests move around in folders and it wont exist when this file
 * is initialized but instead when the method is run.
 */
if (process.env.NODE_ENV !== "test") {
  _Entry = require(path.join(process.cwd(), "src/config/.entry")).default;
}

const HTML5 = "<!DOCTYPE html>";

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
    match({routes: routes, location: req.url}, (error, redirectLocation, renderProps) => {
      if (error) {
        reject(error);
        return;
      }

      resolve({redirectLocation, renderProps});
    });
  });
}

export function redirect (res, redirectLocation) {
  res.redirect(301, redirectLocation.pathname + redirectLocation.search);
}

export function renderNotFound (res, showHelpText=_showHelpText) {
  // This is only hit if there is no 404 handler in the react routes. A
  // not found handler is included by default in new projects.
  showHelpText(MISSING_404_TEXT);
  res.status(404).end("Not Found");
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

export function setHeaders (res, currentRoute) {
  const headers = getHeaders(currentRoute);
  if (headers) {
    res.set(headers);
  }
}

export function enableComponentCaching (componentCacheConfig, isProduction, SSRCaching=_SSRCaching) {
  if (!isProduction) {
    return;
  }

  // only enable caching if componentCacheConfig has an object
  SSRCaching.enableCaching(!!componentCacheConfig);
  if (!!componentCacheConfig) {
    SSRCaching.setCachingConfig(componentCacheConfig);
  }
}

export async function prepareOutput(req, {Index, store, getRoutes, fileName}, renderProps, config, envVariables, getHead=_getHead, Entry=_Entry, _webpackIsomorphicTools=webpackIsomorphicTools) {
  // this should only happen in tests
  if (!Entry) {
    Entry = require(path.join(process.cwd(), "src/config/.entry")).default;
  }

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
  const currentRoute = getCurrentRoute(renderProps);
  const routeAttrs = getEmailAttributes(currentRoute);
  const isEmail = routeAttrs.email;
  const reactRenderFunc = isEmail ? renderToStaticMarkup: renderToString;

  // grab the react generated body stuff. This includes the
  // script tag that hooks up the client side react code.
  const currentState = store.getState();

  let headContent, bodyContent;
  const renderMethod = config.server && config.server.renderMethod;
  if (renderMethod) {
    try {
      const renderOutput  = await Promise.resolve(renderMethod(reactRenderFunc, main));
      headContent = renderOutput.head;
      bodyContent = renderOutput.body;
    }
    catch (e) {
      throw e;
    }
  }
  else {
    bodyContent = reactRenderFunc(main);
  }

  const body = (
    <Body
      html={bodyContent}
      initialState={currentState}
      isEmail={isEmail}
      envVariables={envVariables}
    />
  );
  const head = isEmail ? headContent : getHead(config, fileName, headContent, _webpackIsomorphicTools.assets());

  // Grab the html from the project which is stored in the root
  // folder named Index.js. Pass the body and the head to that
  // component. `head` includes stuff that we want the server to
  // always add inside the <head> tag.
  //
  // Bundle it all up into a string, add the doctype and deliver
  const rootElement = <Index body={body} head={head} req={req} />;

  let responseString;
  if (isEmail) {
    const generateCustomTemplate = ({bodyContent}) => { return `${bodyContent}`; };
    responseString = Oy.renderTemplate(rootElement, {}, generateCustomTemplate);
  }
  else {
    responseString = renderToStaticMarkup(rootElement);
  }

  return {
    responseString,

    // The following is returned for testing
    rootElement
  };
}

export function cacheAndRender (req, res, currentRoute, status, output, cache=_cache, streamResponse=_streamResponse, logger=_logger, enableCache=true) {
  const { responseString } = output;
  const cacheKey = getCacheKey(req);

  const routeAttrs = getEmailAttributes(currentRoute);

  if (currentRoute.cache && enableCache) {
    const cacheTTL = currentRoute.cacheTTL * 1000 || DEFAULT_CACHE_TTL;
    logger.debug(`Caching response for ${cacheKey} - ${cacheTTL}`);
    cache.set(cacheKey, {
      status,
      responseString,
      docType: routeAttrs.docType
    }, cacheTTL);
  }

  streamResponse(req, res, {
    status,
    docType: routeAttrs.docType,
    responseString
  });
}

export function getEmailAttributes (currentRoute) {
  const email = currentRoute.email || false;
  const docType = currentRoute.docType || HTML5;
  return { email, docType };
}

