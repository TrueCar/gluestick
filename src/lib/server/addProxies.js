import httpProxyMiddleware from "http-proxy-middleware";
import { getLogger } from "./logger";
const logger = getLogger();

/**
 * The array of proxy objects follow the following pattern
 * @typedef ProxyConfig
 * @property {String} path the local path that will route to the proxy
 * @property {String} destination the destination url to route proxy requests
 * @property {Object} options http-proxy options object. More information for
 * this options object can be found at:
 * https://github.com/chimurai/http-proxy-middleware
 */

/**
 * `addProxies` takes an express application and a hash of endpoints and
 * corresponding proxy urls. The endpoints are then added as a proxy to the
 * urls.
 *
 * @param {ExpressApp} app the express app that proxies will be applied to
 * @param {Array<ProxyConfig>} proxyConfigs array of proxy objects that will be applied
 * @param {httpProxyMiddleware} [proxy] optional proxy object (mostly for testing)
 *
 */
export default function addProxies (app, proxyConfigs=[], proxy=httpProxyMiddleware) {
  proxyConfigs.forEach((proxyConfig) => {
    const { path, destination, options } = proxyConfig;
    app.use(path, proxy({
      logLevel: logger.level,
      logProvider: () => {
        return logger;
      },
      target: destination,
      pathRewrite: {
        [`^${path}`]: ""
      },
      ...options
    }));
  });
}

