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

      const buildName: string = `${buildType[0].toUpperCase()}${buildType.slice(1)}`;

      logger.success(
        `${buildName} bundle has been prepared `
        + `for ${process.env.NODE_ENV || 'development'}`,
      );

      if (options.stats) {
        createWebpackStats(`${config.GSConfig.webpackStats}-${buildType}`, stats);
        logger.success(`${buildName} webpack stats created`);
      }

      resolve();
    });
  });
};
