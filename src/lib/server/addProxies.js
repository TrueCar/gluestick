import { parse } from "url";
import expressHttpProxy from "express-http-proxy";
import logger from "../../lib/logger";

/**
 * The array of proxy objects follow the following pattern
 * @typedef ProxyConfig
 * @property {String} path the local path that will route to the proxy
 * @property {String} destination the destination url to route proxy requests
 * @property {Object} options express-http-proxy options object. More
 * information for this options object can be found at:
 * https://github.com/villadora/express-http-proxy
 */

/**
 * `addProxies` takes an express application and a hash of endpoints and
 * corresponding proxy urls. The endpoints are then added as a proxy to the
 * urls.
 *
 * @param {ExpressApp} app the express app that proxies will be applied to
 * @param {Array<ProxyConfig>} proxyConfigs array of proxy objects that will be applied
 * @param {ExpressHttpProxy} [proxy] optional proxy object (mostly for testing)
 *
 */
export default function addProxies (app, proxyConfigs=[], proxy=expressHttpProxy) {
  proxyConfigs.forEach((proxyConfig) => {
    const destination = proxyConfig.destination;
    const localPath = proxyConfig.path;
    const { host } = parse(destination);
    app.use(localPath, proxy(host, {
      forwardPath: function (req) {
        const requestPath = parse(req.url).path;
        const destinationPath = parse(destination).path;
        logger.info(`Proxy: ${req.method} ${localPath}${req.url} => ${destination}${requestPath}`);
        return destinationPath + requestPath;
      },
      // Chance to add additional options as well as override `forwardPath`
      ...proxyConfig.options
    }));
    logger.info(`Proxy set up for ${localPath} => ${destination}`);
  });
}

