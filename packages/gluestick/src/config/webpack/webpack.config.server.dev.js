/* @flow */

import type { WebpackConfig } from '../../types';

const webpack = require('webpack');

module.exports = (
  serverConfig: WebpackConfig,
  devServerPort: number,
): WebpackConfig => {
  const configuration: Object = serverConfig;
  configuration.output.publicPath = `http://localhost:${devServerPort}${configuration
    .output.publicPath}`;
  configuration.plugins.push(
    new webpack.BannerPlugin({
      banner: 'require("source-map-support").install();',
      raw: true,
      entryOnly: false,
    }),
  );
  return configuration;
};
