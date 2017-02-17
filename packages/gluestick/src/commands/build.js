/* @flow */
import type { Context, WebpackConfigEntry, Compiler } from '../types.js';

const webpack = require('webpack');

module.exports = ({ logger, config }: Context): void => {
  if (config.webpackConfig) {
    const configuration: WebpackConfigEntry = config.webpackConfig.client;
    const compiler: Compiler = webpack(configuration);

    compiler.run((error: string) => {
      if (error) {
        throw error;
      }
      logger.success('Assets have been prepared for production.');
    });
  } else {
    logger.error('Webpack config not specified');
  }
};
