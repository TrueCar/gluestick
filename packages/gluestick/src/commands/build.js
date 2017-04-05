/* @flow */
import type { Context, WebpackConfig, Compiler } from '../types.js';

const webpack = require('webpack');
const createWebpackStats = require('../config/createWebpackStats');

// @TODO: flow types

const buildClient = (logger, config, options) => {
  const configuration: WebpackConfig = config.webpackConfig.client;
  const compiler: Compiler = webpack(configuration);

  compiler.run((error: string, stats: Object) => {
    if (error) {
      throw new Error(error);
    }
    logger.success('Client bundle has been prepared for production.');

    if (options.stats) {
      logger.info('Creating webpack stats');
      createWebpackStats(`${config.GSConfig.webpackStats}-client`, stats);
    }
  });
};

const buildServer = (logger, config, options) => {
  const configuration: WebpackConfig = config.webpackConfig.server;
  const compiler: Compiler = webpack(configuration);

  compiler.run((error: string, stats: Object) => {
    if (error) {
      throw new Error(error);
    }
    logger.success('Server bundle has been prepared for production.');

    if (options.stats) {
      logger.info('Creating webpack stats');
      createWebpackStats(`${config.GSConfig.webpackStats}-server`, stats);
    }
  });
};

module.exports = ({ logger, config }: Context, ...commandArgs: any[]): void => {
  const options: Object = commandArgs[commandArgs.length - 1];
  if (config.webpackConfig) {
    if (options.client) {
      buildClient(logger, config, options);
    }

    if (options.server) {
      buildServer(logger, config, options);
    }

    if (!options.client && !options.server) {
      buildClient(logger, config, options);
      buildServer(logger, config, options);
    }
  } else {
    logger.error('Webpack config not specified');
  }
};
