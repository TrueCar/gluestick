/* @flow */
import type { Request, Response, BaseLogger } from '../types';

// Intentionally first require so things like require("newrelic") in
// preInitHook get instantiated before anything else. This improves profiling
import hooks, { callHook } from './helpers/hooks';

import config from '../config';
import logger from '../logger';

const path = require('path');
const fs = require('fs');
const express = require('express');
const compression = require('compression');
const middleware = require('./middleware');
const readAssets = require('./helpers/readAssets');
const onFinished = require('on-finished');
const applicationConfig = require('application-config').default;
const entries = require('project-entries').default;

const serverPlugins = require('../plugins/serverPlugins');
const createPluginUtils = require('../plugins/utils');
const setProxies = require('./helpers/setProxies');
const parseRoutePath = require('./helpers/parseRoutePath');

module.exports = function main() {
  // refactor: can move this check into static asset import (synchronous), as this is only ever read once)
  const assetsFilename = path.join(
    process.cwd(),
    config.GSConfig.buildAssetsPath,
    config.GSConfig.webpackChunks,
  );
  if (!fs.existsSync(assetsFilename)) {
    console.log('\n');
    logger.error(
      `File ${assetsFilename} does not exist. Did you forget to compile the client bundle? ` +
        `Run 'gluestick build --client' and try again.`,
    );
  }

  // refactor: once logger is a singleton, this is static
  const pluginUtils = createPluginUtils(logger);

  // Use custom logger from plugins or default logger.
  const customLogger: ?BaseLogger = pluginUtils.getCustomLogger(serverPlugins);

  // Developers can add an optional hook that
  // includes script with initialization stuff.
  // refactor: remove need for null checks on hooks
  if (hooks.preInitServer) {
    callHook(hooks.preInitServer);
  }

  const app: Object = express();
  app.use(compression());
  app.use(
    '/assets',
    express.static(path.join(process.cwd(), config.GSConfig.buildAssetsPath)),
  );

  // refactor: can remove this if we use webpackHotServerMiddleware
  setProxies(app, applicationConfig.proxies, logger);

  // refactor: can remove this if we use webpackHotServerMiddleware
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
  callHook(hooks.postServerRun, app);

  app.use((req: Request, res: Response, next: Function) => {
    // Use SSR middleware only for entries/app routes
    if (
      !Object.keys(entries).find((key: string): boolean =>
        parseRoutePath(key).test(req.url),
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

    readAssets(assetsFilename)
      .then((assets: Object): Promise<void> => {
        return middleware(req, res, {
          assets,
        });
      })
      .catch((error: Error) => {
        logger.error(error);
        res.sendStatus(500);
      });
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
