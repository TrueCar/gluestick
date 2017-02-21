/* @flow */
import type { Context, WebpackConfig, Compiler } from '../types.js';

const path = require('path');
const webpack = require('webpack');
const express = require('express');
const proxy = require('http-proxy-middleware');

type DevelopmentServerOptions = {
  quiet: boolean, // don’t output anything to the console
  noInfo: boolean, // suppress boring information
  hot: boolean, // adds the HotModuleReplacementPlugin and switch the server to hot mode.
  // Note: make sure you don’t add HotModuleReplacementPlugin twice
  inline: boolean, // also adds the webpack/hot/dev-server entry
  // You can use it in two modes:
  // watch mode (default): The compiler recompiles on file change.
  // lazy mode: The compiler compiles on every request to the entry point.
  lazy: boolean,
  // network path for static files: fetch all statics from webpack development server
  publicPath: string,
  headers: Object,
  stats: Object,
};

module.exports = ({ config: { GSConfig, webpackConfig }, logger }: Context): void => {
  if (!webpackConfig) {
    throw new Error('Webpack config not specified');
  }

  if (!GSConfig) {
    throw new Error('Gluestick config not specified');
  }

  const configuration: WebpackConfig = webpackConfig.client;
  const publicPath: string =
    (typeof configuration.output === 'object' && !Array.isArray(configuration.output)) ?
      configuration.output.publicPath : '/';

  const developmentServerOptions: DevelopmentServerOptions = {
    quiet: true,
    noInfo: true,
    hot: true,
    inline: true,
    lazy: false,
    publicPath,
    headers: { 'Access-Control-Allow-Origin': '*' },
    stats: { colors: true },
  };

  const compiler: Compiler = webpack(configuration);

  if (process.env.NODE_ENV !== 'production') {
    const app: Object = express();
    app.use(require('webpack-dev-middleware')(compiler, developmentServerOptions));
    app.use(require('webpack-hot-middleware')(compiler));
    // Proxy http requests from client to renderer server in development mode.
    app.use(proxy({
      changeOrigin: false,
      target: `${GSConfig.protocol}://${GSConfig.host}:${GSConfig.ports.server}`,
      // TODO: make that work
      // logLevel: GSConfig.proxyLogLevel,
      // logProvider: () => logger,
      onError: (err: Object, req: Object, res: Object): void => {
        // When the client is restarting, show our polling message
        res.status(200).sendFile('poll.html', { root: path.join(__dirname, '../lib') });
      },
    }));

    // TODO: add hook
    app.listen(GSConfig.ports.client, GSConfig.host, (error: string) => {
      if (error) {
        logger.error(error);
        return; // eslint-disable-line
      }

      logger.success(`Client server running on ${GSConfig.host}:${GSConfig.ports.client}.`);
    });
  } else {
    compiler.run((error: string) => {
      if (error) {
        throw new Error(error);
      }
      logger.success('Client bundle successfully built.');
    });
  }
};
