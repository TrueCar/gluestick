/* @flow */
import type { Context, WebpackConfig, Compiler } from '../../types.js';

const webpack = require('webpack');
const createWebpackStats = require('../../config/createWebpackStats');
const webpackProgressHandler = require('../../config/webpack/progressHandler');
const { clearBuildDirectory } = require('../utils');
const getEntiresSnapshots = require('./getEntiresSnapshots');

const printAndExit = (error: Error) => {
  console.error(error);
  process.exit(1);
};

const buildFunc = (
  { logger, config } : Context, options: Object, buildType: string,
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

module.exports = ({ logger, config }: Context, ...commandArgs: any[]): void => {
  const options: Object = commandArgs[commandArgs.length - 1];
  if (config.webpackConfig) {
    if (options.client && !options.server) {
      clearBuildDirectory(config.GSConfig, 'client');
      buildFunc({ logger, config }, options, 'client').catch(error => { printAndExit(error); });
    }

    if (options.server && !options.client) {
      clearBuildDirectory(config.GSConfig, 'server');
      // Unmute server compilation
      webpackProgressHandler.toggleMute('server');
      buildFunc({ logger, config }, options, 'server')
        .then(() => {
          return options.static ? getEntiresSnapshots({ config, logger }) : Promise.resolve();
        })
        .catch(error => { printAndExit(error); });
    }

    if ((!options.client && !options.server) || (options.client && options.server)) {
      clearBuildDirectory(config.GSConfig, 'client');
      clearBuildDirectory(config.GSConfig, 'server');
      buildFunc({ logger, config }, options, 'client').catch(error => { printAndExit(error); });
      buildFunc({ logger, config }, options, 'server')
        .then(() => {
          return options.static ? getEntiresSnapshots({ config, logger }) : Promise.resolve();
        })
        .catch(error => { printAndExit(error); });
    }
  } else {
    logger.error('Webpack config not specified');
  }
};
