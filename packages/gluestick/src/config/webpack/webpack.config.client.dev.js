/* @flow */
import type { WebpackConfig, BabelOptions } from '../../types';

const webpack = require('webpack');
const { updateBabelLoaderConfig } = require('./utils');
const clone = require('clone');

module.exports = (
  clientConfig: WebpackConfig,
  devServerPort: number,
  devServerHost: string,
): WebpackConfig => {
  const config = clone(clientConfig);
  config.devtool = 'cheap-module-source-map';
  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.LoaderOptionsPlugin({
      test: /\.(scss|css)$/,
      debug: true,
    }),
  );
  config.entry = Object.keys(config.entry).reduce((prev, curr) => {
    return Object.assign(prev, {
      [curr]: [
        'eventsource-polyfill',
        'react-hot-loader/patch',
        `webpack-hot-middleware/client?path=http://${devServerHost}:${devServerPort}/__webpack_hmr`,
        'webpack/hot/only-dev-server',
      ].concat(config.entry[curr]),
    });
  }, {});
  // Add react transformation to babel-loader plugins.
  updateBabelLoaderConfig(config, (options: BabelOptions): BabelOptions => {
    return {
      ...options,
      plugins: [...options.plugins, 'react-hot-loader/babel'],
    };
  });
  // config.module.rules[0].use[0].options.presets.push('react-hmre');
  config.output.publicPath = `http://${devServerHost}:${devServerPort}${config
    .output.publicPath}`;
  config.output.crossOriginLoading = 'anonymous';
  // https://github.com/webpack/webpack/issues/3486
  config.performance = { hints: false };
  return config;
};
