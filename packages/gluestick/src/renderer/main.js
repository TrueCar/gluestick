/* @flow */

/**
 * To import/require file from project use aliases:
 *   root, src, actions, assets, components, containers, reducers, config
 * To import/require renderer server file use relative paths.
 */

import type {
  Context,
  Request,
  Response,
  ServerPlugin,
  BaseLogger,
} from '../types';

const path = require('path');
const express = require('express');
const compression = require('compression');
const middleware = require('./middleware');
const readAssets = require('./helpers/readAssets');
const onFinished = require('on-finished');
// $FlowIgnore
const applicationConfig = require('application-config').default;
const entries = require('project-entries').default;
// $FlowIgnore
const entriesConfig = require('project-entries-config');
// $FlowIgnore
const EntryWrapper = require('entry-wrapper').default;
// $FlowIgnore
const projectHooks = require('gluestick-hooks').default;
const BodyWrapper = require('./components/Body').default;
const reduxMiddlewares = require('redux-middlewares').default;
// $FlowIgnore
const thunkMiddleware = require('redux-middlewares').thunkMiddleware;
// $FlowIgnore
const entriesPlugins = require('project-entries').plugins;
// $FlowIgnore
const cachingConfig = require('caching-config').default;

const hooksHelper = require('./helpers/hooks');
const prepareServerPlugins = require('../plugins/prepareServerPlugins');
const createPluginUtils = require('../plugins/utils');
const setProxies = require('./helpers/setProxies');

const envVariables: string[] =
  process.env.ENV_VARIABLES && Array.isArray(process.env.ENV_VARIABLES)
    ? process.env.ENV_VARIABLES
    : [];

module.exports = ({ config, logger }: Context) => {
  const pluginUtils = createPluginUtils(logger);
  const serverPlugins: ServerPlugin[] = prepareServerPlugins(
    logger,
    entriesPlugins,
  );

  // Use custom logger from plugins or default logger.
  const customLogger: ?BaseLogger = pluginUtils.getCustomLogger(serverPlugins);

  // Merge hooks from project and plugins' hooks.
  const hooks = hooksHelper.merge(projectHooks, serverPlugins);

  // Developers can add an optional hook that
  // includes script with initialization stuff.
  if (hooks.preInitServer) {
    hooksHelper.call(hooks.preInitServer);
  }

  // Get runtime plugins that will be passed to EntryWrapper.
  const runtimePlugins: Object[] = entriesPlugins
    .filter((plugin: Object) => plugin.type === 'runtime')
    .map((plugin: Object) => plugin.ref);

  const app: Object = express();
  app.use(compression());
  app.use(
    '/assets',
    express.static(path.join(process.cwd(), config.GSConfig.buildAssetsPath)),
  );

  setProxies(app, applicationConfig.proxies, logger);

  if (process.env.NODE_ENV !== 'production') {
    app.get('/gluestick-proxy-poll', (req: Request, res: Response) => {
      // allow requests from our client side loading page
      res.header('Access-Control-Allow-Origin', '*');
      res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept',
      );
      res.status(200).json({ up: true });
    });
  }

  app.use((req: Request, res: Response, next: Function) => {
    // Use SSR middleware only for entries/app routes
    if (
      !Object.keys(entries).find((key: string): boolean =>
        req.url.startsWith(key),
      )
    ) {
      next();
      return;
    }

    if (customLogger) {
      customLogger.info({ req });
      onFinished(res, (err, response) => {
        if (err) {
          customLogger.error(err);
        } else {
          customLogger.info({ res: response });
        }
      });
    }

    readAssets(
      `${config.GSConfig.buildAssetsPath}/${config.GSConfig.webpackChunks}`,
    )
      .then((assets: Object): Promise<void> => {
        return middleware(
          { config, logger },
          req,
          res,
          { entries, entriesConfig, entriesPlugins: runtimePlugins },
          { EntryWrapper, BodyWrapper },
          { assets, loadjsConfig: applicationConfig.loadjs || {} },
          {
            reduxMiddlewares,
            thunkMiddleware,
            envVariables,
            httpClient: applicationConfig.httpClient || {},
            entryWrapperConfig: {},
          },
          { hooks, hooksHelper: hooksHelper.call },
          serverPlugins,
          cachingConfig,
        );
      })
      .catch((error: Error) => {
        logger.error(error);
        res.sendStatus(500);
      });
  });

  // Call express App Hook which accept app as param.
  hooksHelper.call(hooks.postServerRun, app);

  // 404 handler
  // @TODO: support custom 404 error page
  app.use((req: Request, res: Response) => {
    logger.warn(`${req.method} ${req.url} was not found`);
    res.sendStatus(404);
  });

  const server: Object = app.listen(config.GSConfig.ports.server);

  logger.success(`Renderer listening on port ${config.GSConfig.ports.server}.`);
  process.on('exit', () => {
    server.close();
  });
  process.on('SIGINT', () => {
    server.close();
  });
};
