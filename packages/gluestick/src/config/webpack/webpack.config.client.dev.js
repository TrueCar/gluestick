/* @flow */
import type {
  WebpackConfig,
  UniversalWebpackConfigurator,
  BabelOptions,
} from '../../types';

const webpack = require('webpack');
const { updateBabelLoaderConfig } = require('./utils');

module.exports = (
  clientConfig: UniversalWebpackConfigurator,
  devServerPort: number,
  devServerHost: string,
): WebpackConfig => {
  const configuration: Object = clientConfig({
    development: true,
    css_bundle: true,
  });
  configuration.devtool = 'cheap-module-eval-source-map';
  configuration.plugins.push(
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
  configuration.entry = Object.keys(
    configuration.entry,
  ).reduce((prev, curr) => {
    return Object.assign(prev, {
      [curr]: [
        'eventsource-polyfill',
        'react-hot-loader/patch',
        `webpack-hot-middleware/client?path=http://${devServerHost}:${devServerPort}/__webpack_hmr`,
        'webpack/hot/only-dev-server',
      ].concat(configuration.entry[curr]),
    });
  }, {});
  // Add react transformation to babel-loader plugins.
  updateBabelLoaderConfig(
    configuration,
    (options: BabelOptions): BabelOptions => {
      return {
        ...options,
        plugins: [...options.plugins, 'react-hot-loader/babel'],
      };
    },
  );
  // configuration.module.rules[0].use[0].options.presets.push('react-hmre');
  configuration.output.publicPath = `http://${devServerHost}:${devServerPort}${configuration
    .output.publicPath}`;
  // https://github.com/webpack/webpack/issues/3486
  configuration.performance = { hints: false };
  return configuration;
};
