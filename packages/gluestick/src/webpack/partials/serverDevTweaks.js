/* @flow */

const webpack = require('webpack');

module.exports = (baseConfig, { devServerPort }) =>
  baseConfig
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
      config.output.publicPath = `http://localhost:${devServerPort}${config
        .output.publicPath}`;
    });
