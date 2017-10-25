/* @flow */

/**
 * To import/require file from project use aliases:
 *   root, src, actions, assets, components, containers, reducers, config
 * To import/require renderer server file use relative paths.
 */
/* eslint-disable prefer-arrow-callback */

import type { Context, Request, Response } from '../types';

// This file should only do things required for production, not development,
// in order to support webpack-hot-server-middleware.

// I don't know if the comment below is still true
// Intentionally first require so things like require("newrelic") in
// preInitHook get instantiated before anything else. This improves profiling
// $FlowIgnore
const projectHooks = require('gluestick-hooks').default;

const path = require('path');
const fs = require('fs');
const express = require('express');
const compression = require('compression');
const middleware = require('./middleware');
const loggerMiddleware = require('./loggerMiddleware');
const readAssets = require('./helpers/readAssets');
// Fix these. Set up .flowconfig file to point to expected interface.
// We're going to need something very similar for `import Header from "partner"`
// $FlowIgnore
const applicationConfig = require('application-config').default;
const entries = require('project-entries').default;
// $FlowIgnore
const entriesConfig = require('project-entries-config');
// $FlowIgnore
const EntryWrapper = require('entry-wrapper').default;
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
const setProxies = require('./helpers/setProxies');

const envVariables: string[] =
  process.env.ENV_VARIABLES && Array.isArray(process.env.ENV_VARIABLES)
    ? process.env.ENV_VARIABLES
    : [];

module.exports = function startRenderer({ config, logger }: Context) {
  // Do this with readFileSync once after webpack-flush-chunks is in.
  // This becomes production-only.
  const assetsFilename = path.join(
    process.cwd(),
    config.GSConfig.buildAssetsPath,
    config.GSConfig.webpackChunks,
  );
  if (!fs.existsSync(assetsFilename)) {
    console.log('\n');
    // Throw an error, don't continue!
    logger.error(
      `File ${assetsFilename} does not exist. Did you forget to compile the client bundle? ` +
        `Run 'gluestick build --client' and try again.`,
    );
  }

  const serverPlugins = prepareServerPlugins(logger, entriesPlugins);

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
  app.use(compression()); // done in both dev + production?
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

  // Call express App Hook which accept app as param.
  hooksHelper.call(hooks.postServerRun, app);

  app.use(loggerMiddleware(logger));
  app.use(function gluestickRequestHandler(
    req: Request,
    res: Response,
    next: Function,
  ) {
    // If this isn't done on every request, this becomes much simpler.
    // Use a closure for most of this.
    // Middleware is (configuration) => (req, res) => {}
    return middleware(
      { config, logger },
      { entries, entriesConfig, entriesPlugins: runtimePlugins },
      { EntryWrapper, BodyWrapper },
      { assetsFilename, loadjsConfig: applicationConfig.loadjs || {} },
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
      req,
      res,
      next,
    );
  });

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
