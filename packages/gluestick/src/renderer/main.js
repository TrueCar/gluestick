/**
 * To import/require file from project use aliases:
 *   root, src, actions, assets, components, containers, reducers, config
 * To import/require renderer server file use relative paths.
 */
const path = require('path');
const express = require('express');
const compression = require('compression');
const middleware = require('./middleware');

const entries = require('root/entries').default;
const EntryWrapper = require('config/.entry').default;
const BodyWrapper = require('./components/Body').default;
const assets = require('root/build/assets/webpack-chunks');

module.exports = ({ config, logger }) => {
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
      req, res,
      { config, logger },
      entries,
      { EntryWrapper, BodyWrapper },
      assets,
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
