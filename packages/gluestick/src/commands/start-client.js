/* @flow */
import type { CommandAPI, Logger, WebpackConfig, Compiler } from '../types.js';

const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const express = require('express');
const proxy = require('http-proxy-middleware');
const progressHandler = require('../config/webpack/progressHandler');
const { printWebpackStats, debounce } = require('../utils');
const build = require('./build');

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

module.exports = (
  commandApi: CommandAPI,
  commandArguments: any[],
  { printCommandInfo }: { printCommandInfo: boolean } = {
    printCommandInfo: true,
  },
) =>
  new Promise((resolve, reject) => {
    const { getLogger, getContextConfig, getOptions } = commandApi;
    const logger: Logger = getLogger();

    if (printCommandInfo) {
      logger.clear();
      logger.printCommandInfo();
    }

    const options = getOptions(commandArguments);

    if (process.env.NODE_ENV === 'production') {
      build(commandApi, [
        '--client',
        {
          ...options,
          client: true,
          parent: {
            ...options.parent,
            rawArgs: ['--client'],
          },
        },
      ]);
      return;
    }

    const { webpackConfig, GSConfig } = getContextConfig(logger, {
      skipServerEntryGeneration: true,
      entryOrGroupToBuild: options.entrypoints || options.app,
    });

    const configuration: WebpackConfig = webpackConfig.client;
    const publicPath: string =
      typeof configuration.output === 'object' &&
      !Array.isArray(configuration.output)
        ? configuration.output.publicPath
        : '/';

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
    progressHandler.toggleMute('client');
    let printedWebpackStats: boolean = false;

    compiler.plugin(
      'done',
      debounce(stats => {
        if (!printedWebpackStats) {
          printedWebpackStats = true;
          printWebpackStats(logger, stats);
        }
        resolve();
      }, 1000),
    );

    const app: Object = express();
    app.engine(
      'html',
      (filePath: string, opts: { [key: string]: any }, next: Function) => {
        fs.readFile(filePath, (error, template: Buffer) => {
          if (error) {
            return next(error);
          }
          return next(
            null,
            template.toString().replace(/{{ ?(\w+) ?}}/g, (match, key) => {
              return opts[key];
            }),
          );
        });
      },
    );
    app.set('view engine', 'html');
    const devMiddleware = require('webpack-dev-middleware')(
      compiler,
      developmentServerOptions,
    );
    devMiddleware.waitUntilValid(() => {
      progressHandler.markValid('client');
    });
    app.use(devMiddleware);
    app.use(require('webpack-hot-middleware')(compiler, { log: () => {} }));
    // Proxy http requests from client to renderer server in development mode.
    app.use(
      proxy({
        changeOrigin: false,
        target: `${GSConfig.protocol}://${GSConfig.host}:${GSConfig.ports
          .server}`,
        logLevel: GSConfig.proxyLogLevel,
        logProvider: () => logger,
        onError: (err: Object, req: Object, res: Object): void => {
          // When the client is restarting, show our polling message
          res.render(path.join(__dirname, '../lib/poll.html'), {
            port: GSConfig.ports.server,
          });
        },
      }),
    );

    // TODO: add hook
    app.listen(GSConfig.ports.client, GSConfig.host, (error: string) => {
      if (error) {
        logger.error(error);
        reject(error);
      return; // eslint-disable-line
      }
      logger.success(
        `Client server running on ${GSConfig.host}:${GSConfig.ports.client}.`,
      );
      progressHandler.toggleMute('client');
    });
  });
