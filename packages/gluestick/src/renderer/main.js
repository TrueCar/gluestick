/* @flow */
/**
 * To import/require file from project use aliases:
 *   root, src, actions, assets, components, containers, reducers, config
 * To import/require renderer server file use relative paths.
 */

import type {
  Context,
} from '../types';

const path = require('path');
const express = require('express');
const compression = require('compression');
const middleware = require('./middleware');
// $FlowIgnore
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


module.exports = ({ config, logger }: Context) => {
  const app = express();
  app.use(compression());
  app.use(express.static(
    path.join(process.cwd(), config.GSConfig.assetsPath),
  ));

  if (process.env.NODE_ENV !== 'production') {
    app.get('/gluestick-proxy-poll', (req, res) => {
      // allow requests from our client side loading page
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      res.status(200).json({ up: true });
    });
  }

  app.use((req, res) => {
    middleware(
      { config, logger },
      req, res,
      { entries, entriesConfig },
      { EntryWrapper, BodyWrapper },
      assets,
      { envVariables: [], httpClient: {}, entryWrapperConfig: {} },
      hooks,
    );
  });

  const server = app.listen(config.GSConfig.ports.server);
  logger.success(`Renderer listening on port ${config.GSConfig.ports.server}.`);
  process.on('exit', () => {
    server.close();
  });
  process.on('SIGINT', () => {
    server.close();
  });
};
