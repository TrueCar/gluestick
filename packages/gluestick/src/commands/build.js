/* @flow */
import type { Context, WebpackConfig, Compiler } from '../types.js';

const webpack = require('webpack');

module.exports = ({ logger, config }: Context): void => {
  if (config.webpackConfig) {
    const configuration: WebpackConfig = config.webpackConfig.client;
    const compiler: Compiler = webpack(configuration);

    compiler.run((error: string) => {
      if (error) {
        throw new Error(error);
      }
      logger.success('Assets have been prepared for production.');
    });
  } else {
    logger.error('Webpack config not specified');
  }
};
