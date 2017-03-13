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
} from '../types';

const path = require('path');
const express = require('express');
const compression = require('compression');
const middleware = require('./middleware');
const entries = require('project-entries').default;
// $FlowIgnore
const entriesConfig = require('project-entries-config');
// $FlowIgnore
const EntryWrapper = require('entry-wrapper').default;
// $FlowIgnore
const assets = require('webpack-chunks');
// $FlowIgnore
const projectHooks = require('gluestick-hooks').default;
const BodyWrapper = require('./components/Body').default;
// $FlowIgnore
const reduxMiddlewares = require('redux-middlewares').default;
// $FlowIgnore
const entriesPlugins = require('project-entries').plugins;
const hooksHelper = require('./helpers/hooks');
const prepareServerPlugins = require('../plugins/prepareServerPlugins');

// $FlowIgnore Assets should be bundled into render to serve them in production.
require.context('build-assets');

module.exports = ({ config, logger }: Context) => {
  const serverPlugins: ServerPlugin[] = prepareServerPlugins(logger, entriesPlugins);
  // Merge hooks from project and plugins' hooks.
  const hooks = hooksHelper.merge(projectHooks, serverPlugins);
  // Developers can add an optional hook that
  // includes script with initialization stuff.
  if (hooks.preInitServer && typeof hooks.preInitServer === 'function') {
    hooks.preInitServer();
  }

  // Get runtime plugins that will be passed to EntryWrapper.

  // Developers can add an optional hook that
  // includes script with initialization stuff.
  if (hooks.preInitServer && typeof hooks.preInitServer === 'function') {
    hooks.preInitServer();
  }

  const runtimePlugins: Function[] = entriesPlugins
    .filter((plugin: Object) => plugin.type === 'runtime')
    .map((plugin: Object) => plugin.ref);

  const app: Object = express();
  app.use(compression());
  app.use('/assets', express.static(
    path.join(process.cwd(), config.GSConfig.buildAssetsPath),
  ));

  if (process.env.NODE_ENV !== 'production') {
    app.get('/gluestick-proxy-poll', (req: Request, res: Response) => {
      // allow requests from our client side loading page
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      res.status(200).json({ up: true });
    });
  }

  app.use((req: Request, res: Response) => {
    middleware(
      { config, logger },
      req, res,
      { entries, entriesConfig, entriesPlugins: runtimePlugins },
      { EntryWrapper, BodyWrapper },
      assets,
      {
        reduxMiddlewares,
        envVariables: [],
        httpClient: {},
        entryWrapperConfig: {},
      },
      { hooks, hooksHelper: hooksHelper.call },
      serverPlugins,
    );
  });

  const server: Object = app.listen(config.GSConfig.ports.server);

  // Call express App Hook which accept app as param.
  hooksHelper.call(hooks.postServerRun, app);

  logger.success(`Renderer listening on port ${config.GSConfig.ports.server}.`);
  process.on('exit', () => {
    server.close();
  });
  process.on('SIGINT', () => {
    server.close();
  });
};
