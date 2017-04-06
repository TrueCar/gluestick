/* @flow */
import type { Context, WebpackConfig, Compiler } from '../types.js';

const webpack = require('webpack');
const createWebpackStats = require('../config/createWebpackStats');
const webpackProgressHandler = require('../config/webpack/progressHandler');
const { clearBuildDirectory } = require('./utils');

const buildFunc = ({ logger, config } : Context, options: Object, buildType: string): void => {
  const configuration: WebpackConfig = config.webpackConfig[buildType];
  const compiler: Compiler = webpack(configuration);

  compiler.run((error: string, stats: Object) => {
    if (error) {
      throw new Error(error);
    }
    logger.success(
      `${buildType[0].toUpperCase()}${buildType.slice(1)} bundle has been prepared for production.`,
    );

    if (options.stats) {
      logger.info('Creating webpack stats');
      createWebpackStats(`${config.GSConfig.webpackStats}-${buildType}`, stats);
    }
  });
};

module.exports = ({ logger, config }: Context, ...commandArgs: any[]): void => {
  const options: Object = commandArgs[commandArgs.length - 1];
  if (config.webpackConfig) {
    if (options.client && !options.server) {
      clearBuildDirectory(config.GSConfig, 'client');
      buildFunc({ logger, config }, options, 'client');
    }

    if (options.server && !options.client) {
      clearBuildDirectory(config.GSConfig, 'server');
      // Unmute server compilation
      webpackProgressHandler.toggleMute('server');
      buildFunc({ logger, config }, options, 'server');
    }

    if ((!options.client && !options.server) || (options.client && options.server)) {
      clearBuildDirectory(config.GSConfig, 'client');
      clearBuildDirectory(config.GSConfig, 'server');
      buildFunc({ logger, config }, options, 'client');
      buildFunc({ logger, config }, options, 'server');
    }
  } else {
    logger.error('Webpack config not specified');
  }
};
