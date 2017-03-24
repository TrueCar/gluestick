/* @flow */

import type { WebpackConfig } from '../../types';

const webpack = require('webpack');

module.exports = (serverConfig: WebpackConfig, devServerPort: number): WebpackConfig => {
  const configuration: Object = serverConfig;
  configuration.plugins.push(
    new webpack.DefinePlugin({
      'process.env.COMPILATION_TIMESTAMP': JSON.stringify(new Date().toISOString()),
    }),
  );
  configuration.output.publicPath = `http://localhost:${devServerPort}${
    configuration.output.publicPath}`;
  return configuration;
};
