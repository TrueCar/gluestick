/* eslint-disable no-shadow */
// import path from 'path';
// import * as RequestHandler from '../lib/server/RequestHandler';
// import errorHandler from '../lib/server/errorHandler';
// import detectEnvironmentVariables from '../lib/detectEnvironmentVariables';
const getRenderRequirementsFromEntrypoints = require('../lib/server/getRenderRequirementsFromEntrypoints');
// import loadServerConfig from '../lib/server/loadServerConfig';
// const GLOBAL_CONFIG_PATH = path.join(process.cwd(), 'src', 'config', 'application');
//
// let GLOBAL_CONFIG;
// let SERVER_CONFIG;
// let EXPOSED_ENV_VARIABLES;
//
// if (process.env.NODE_ENV !== 'test') {
//   GLOBAL_CONFIG = require(GLOBAL_CONFIG_PATH).default;
//
//   SERVER_CONFIG = loadServerConfig();
//
//   EXPOSED_ENV_VARIABLES = detectEnvironmentVariables(`${GLOBAL_CONFIG_PATH}.js`);
// }
//
// const defaults = {
//   config: {
//     ...GLOBAL_CONFIG,
//     server: {
//       ...SERVER_CONFIG,
//     },
//   },
//   RequestHandler,
//   errorHandler,
//   getRenderRequirementsFromEntrypoints,
//   exposedEnvVariables: EXPOSED_ENV_VARIABLES,
// };

// This has been moved outside of the render method because it only needs to be
// run once
// RequestHandler.enableComponentCaching(defaults.config.server.componentCacheConfig, process.env.NODE_ENV === 'production');

module.exports = (req, res, config, logger) => {
  // Allow overriding of default methods, this is mostly to mock out methods
  // for testing
  // console.log(config);
  // const {
  //   config,
  //   RequestHandler,
  //   errorHandler,
  //   getRenderRequirementsFromEntrypoints,
  //   exposedEnvVariables,
  // } = { ...defaults, ...overrides };

  // try {
    // if (RequestHandler.renderCachedResponse(req, res)) {
    //   return;
    // }
  // logger.warn('CZYTAM');
  const renderRequirements = getRenderRequirementsFromEntrypoints(req, res, config, logger);
  logger.info('-------------------------------', renderRequirements.Index.toString());
  res.send('bliblable');
  //
  //   const {
  //     redirectLocation,
  //     renderProps,
  //   } = await RequestHandler.matchRoute(req, res, getRoutes, store, config);
  //
  //   if (redirectLocation) {
  //     RequestHandler.redirect(res, redirectLocation);
  //     return;
  //   }
  //
  //   if (!renderProps) {
  //     RequestHandler.renderNotFound(res);
  //     return;
  //   }
  //
  //   await RequestHandler.runPreRenderHooks(req, renderProps, store);
  //
  //   const currentRoute = RequestHandler.getCurrentRoute(renderProps);
  //   RequestHandler.setHeaders(res, currentRoute);
  //
  //   const status = RequestHandler.getStatusCode(store.getState(), currentRoute);
  //   const output =
  //     await RequestHandler.prepareOutput(
  //       req, renderRequirements, renderProps, config, exposedEnvVariables,
  //     );
  //   RequestHandler.cacheAndRender(req, res, currentRoute, status, output);
  // } catch (e) {
  //   errorHandler(req, res, e, config);
  // }
};
