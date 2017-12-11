/* @flow */

import type { WebpackConfig } from '../types';

const webpack = require('webpack');

const gluestickConfig = require('../../config/defaults/glueStickConfig');

module.exports = function tweakServerConfigForDev(
  baseConfig: WebpackConfig,
): WebpackConfig {
  const { protocol, host, ports } = gluestickConfig;

  return baseConfig
    .merge({
      plugins: [
        new webpack.BannerPlugin({
          banner: 'require("source-map-support").install();',
          raw: true,
          entryOnly: false,
        }),
      ],
    })
    .merge(config => {
      // eslint-disable-next-line no-param-reassign
      config.output.publicPath = `${protocol}://${host}:${ports.client}${config
        .output.publicPath}`;
    });
};
