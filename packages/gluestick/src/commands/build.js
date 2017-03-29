/* @flow */
import type { Context, WebpackConfig, Compiler } from '../types.js';

const webpack = require('webpack');
const createWebpackStats = require('../config/createWebpackStats');

module.exports = ({ logger, config }: Context, options: Object): void => {
  if (config.webpackConfig) {
    const configuration: WebpackConfig = config.webpackConfig.client;
    const compiler: Compiler = webpack(configuration);

    compiler.run((error: string, stats: Object) => {
      if (error) {
        throw new Error(error);
      }
      logger.success('Assets have been prepared for production.');

      if (options.stats) {
        logger.info('Creating webpack stats');
        createWebpackStats(`${config.GSConfig.webpackStats}-client`, stats);
      }
    });
  } else {
    logger.error('Webpack config not specified');
  }
};
