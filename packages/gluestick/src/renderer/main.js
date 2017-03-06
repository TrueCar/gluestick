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
  // ServerPlugin,
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
const hooks = require('gluestick-hooks');
const BodyWrapper = require('./components/Body').default;
// $FlowIgnore
const reduxMiddlewares = require('redux-middlewares').default;
// $FlowIgnore
const entriesPlugins = require('project-entries').plugins;
// @NOTE: uncomment this line to be able to use server plugins
// const prepareServerPlugins = require('../plugins/prepareServerPlugins');

module.exports = ({ config, logger }: Context) => {
  // @NOTE: uncomment this line to be able to use server plugins
  // const serverPlugins: ServerPlugin[] = prepareServerPlugins(logger, entriesPlugins);
  // logger.debug(serverPlugins);
  // Get runtime plugins that will be passed to EntryWrapper.
  const runtimePlugins: Function[] = entriesPlugins
    .filter((plugin: Object) => plugin.type === 'runtime')
    .map((plugin: Object) => plugin.ref);

  const app: Object = express();
  app.use(compression());
  app.use(express.static(
    path.join(process.cwd(), config.GSConfig.assetsPath),
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
      hooks,
    );
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
