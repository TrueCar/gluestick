/* @flow */

import type { BaseLogger } from '../../types';

const proxy = require('http-proxy-middleware');

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
 * `setProxis` takes an express application instance and a hash of endpoints and
 * corresponding proxy urls. The endpoints are then added as a proxy to the
 * urls.
 *
 * @param {ExpressApp} app the express app that proxies will be applied to
 * @param {Array<ProxyConfig>} proxyConfigs array of proxy objects that will be applied
 *
 */
module.exports = (
  app: Object,
  proxyConfigs: Object[] = [],
  logger: BaseLogger,
) => {
  proxyConfigs.forEach((proxyConfig: Object): void => {
    const { filter, path, destination, options } = proxyConfig;
    const actualConfig = {
      logLevel: logger.level,
      logProvider: () => logger,
      target: destination,
      pathRewrite: {
        [`^${path}`]: '',
      },
      onError: (err, req, res) => {
        logger.error(`Proxy error: ${err}`);
        res.status(500).send('Proxy error');
      },
      ...options,
    };

    const proxyInstance =
      typeof filter === 'function'
        ? proxy(filter, actualConfig)
        : proxy(actualConfig);

    app.use(path, proxyInstance);
  });
};
