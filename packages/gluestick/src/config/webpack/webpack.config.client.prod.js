/* @flow */
import type { WebpackConfig, UniversalWebpackConfigurator } from '../../types';

const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const webpack = require('webpack');
const path = require('path');

module.exports = (
  clientConfig: UniversalWebpackConfigurator,
): WebpackConfig => {
  const configuration: Object = clientConfig({ development: false });
  configuration.devtool = 'hidden-source-map';
  configuration.plugins.push(
    new OptimizeCSSAssetsPlugin({ canPrint: false }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false,
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
      },
      sourceMap: true,
    }),
    new webpack.NormalModuleReplacementPlugin(
      /gluestick\/shared\/lib\/errorUtils/,
      path.join(__dirname, './mocks/emptyObjMock.js'),
    ),
  );
  configuration.bail = true;
  return configuration;
};
