/* @flow */

import type { WebpackConfig, UniversalWebpackConfigurator } from '../../types';

const webpack = require('webpack');
const path = require('path');

module.exports = (
  clientConfig: UniversalWebpackConfigurator,
): WebpackConfig => {
  const configuration: Object = clientConfig({ development: false });
  configuration.devtool = 'hidden-source-map';
  configuration.plugins.push(
    new webpack.optimize.CommonsChunkPlugin({
      names: ['bootstrap'], // needed to put webpack bootstrap code before chunks
      filenameTemplate: '[name].js',
      children: true,
      deepChildren: true,
      // minChunks: Infinity,
    }),
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
