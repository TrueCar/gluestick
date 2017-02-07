const path = require('path');
const webpack = require('webpack');
const process = require('process');
const express = require('express');
const proxy = require('http-proxy-middleware');
// const fs = require('fs-extra');

// const build = require('./build');
// const getWebpackConfig = require('../config/getWebpackClientConfig');
// const getAssetPath = require('../lib/getAssetPath');
// const loadServerConfig = require('../lib/server/loadServerConfig');

// import { getLogger } from '../lib/server/logger';
// const LOGGER = getLogger();

// const APP_ROOT = process.cwd();
// const APP_CONFIG_PATH = path.join(APP_ROOT, 'src', 'config', 'application.js');
// const ASSET_PATH = getAssetPath();
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
// @TODO Make this value a function rather than a global, or better yet, get it passed in
// const PUBLIC_PATH = ASSET_PATH;
process.env.NODE_PATH = path.join(__dirname, '../..');

module.exports = ({ config, logger }) => {
  const { GSConfig } = config;
  const configuration = config.webpackConfig.client.dev;
  console.log(configuration);
  const developmentServerOptions = {
    quiet: true, // don’t output anything to the console
    noInfo: true, // suppress boring information
    hot: true, // adds the HotModuleReplacementPlugin and switch the server to hot mode. Note: make sure you don’t add HotModuleReplacementPlugin twice
    inline: true, // also adds the webpack/hot/dev-server entry

    // You can use it in two modes:
    // watch mode (default): The compiler recompiles on file change.
    // lazy mode: The compiler compiles on every request to the entry point.
    lazy: false,

    // network path for static files: fetch all statics from webpack development server
    publicPath: configuration.output.publicPath,

    headers: { 'Access-Control-Allow-Origin': '*' },
    stats: { colors: true },
  };

  const compiler = webpack(configuration);

  // const appServerConfig = loadServerConfig();
  const assetPort = /* appServerConfig.assetPort ||*/ 8880;
  console.log(2);
  if (!IS_PRODUCTION) {
    const app = express();
    app.use(require('webpack-dev-middleware')(compiler, developmentServerOptions));
    app.use(require('webpack-hot-middleware')(compiler));
    console.log(3);
    // Proxy http requests from server to client in development mode
    /*app.use(proxy({
      changeOrigin: false,
      target: `${server.protocol}://${server.host}:${assetPort}`,
      logLevel: null, // TODO: LOGGER.level,
      logProvider: () => null, // TODO: () => LOGGER,
      onError: (err, req, res) => {
        // When the client is restarting, show our polling message
        res.status(200).sendFile('poll.html', { root: path.join(__dirname, '../lib') });
      },
    }));*/

    /* if (typeof appServerConfig.expressConfigurator === 'function') {
      appServerConfig.expressConfigurator(app);
    }*/
    console.log(4);
    app.listen(GSConfig.ports.client, GSConfig.host, error => {
      if (error) {
        console.log(error);
        // TODO: Replace logger.
        // LOGGER.error(error);
        // TODO: remove eslint disable
        return; // eslint-disable-line
      }


      // LOGGER.info(`Server running on ${server.protocol}://${server.host}:${server.port}`);
    });
  }/* else {
    build();
  }*/
};
