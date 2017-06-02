/* @flow */
import type { CLIContext, WebpackConfig, Compiler } from '../../types.js';

const webpack = require('webpack');
const createWebpackStats = require('../../config/createWebpackStats');
const { printWebpackStats } = require('../../utils');

module.exports = (
  { logger, config }: CLIContext, options: Object, buildType: string,
): Promise<void> => {
  const configuration: WebpackConfig = config.webpackConfig[buildType];
  const compiler: Compiler = webpack(configuration);
  return new Promise((resolve, reject) => {
    compiler.run((error: string, stats: Object) => {
      if (error) {
        reject(error);
        return;
      }

      const buildName: string = `${buildType[0].toUpperCase()}${buildType.slice(1)}`;

      const buildTime = stats.toJson({ timing: true }).time;

      logger.success(
        `${buildName} bundle has been prepared `
        + `for ${process.env.NODE_ENV || 'development'} in ${(buildTime / 1000).toFixed(2)}s`,
      );

      if (buildType === 'client') {
        printWebpackStats(logger, stats);
      }

      if (options.stats) {
        createWebpackStats(`${config.GSConfig.webpackStats}-${buildType}`, stats);
        logger.success(`${buildName} webpack stats created`);
      }

      resolve();
    });
  });
};
