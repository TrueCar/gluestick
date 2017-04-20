/* @flow */
import type { Context, WebpackConfig, Compiler } from '../../types.js';

const webpack = require('webpack');
const createWebpackStats = require('../../config/createWebpackStats');

module.exports = (
  { logger, config }: Context, options: Object, buildType: string,
): Promise<void> => {
  const configuration: WebpackConfig = config.webpackConfig[buildType];
  const compiler: Compiler = webpack(configuration);
  return new Promise((resolve, reject) => {
    compiler.run((error: string, stats: Object) => {
      if (error) {
        reject(error);
      }

      logger.success(
        `${buildType[0].toUpperCase()}${buildType.slice(1)} bundle has been prepared `
        + `for ${process.env.NODE_ENV || 'development'}`,
      );

      if (options.stats) {
        logger.info('Creating webpack stats');
        createWebpackStats(`${config.GSConfig.webpackStats}-${buildType}`, stats);
      }

      resolve();
    });
  });
};
