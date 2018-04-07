/* @flow */

import type { WebpackConfig, UniversalWebpackConfigurator } from '../../types';

const webpack = require('webpack');
const path = require('path');
const ExtractCssChunks = require('extract-css-chunks-webpack-plugin');

module.exports = (
  clientConfig: UniversalWebpackConfigurator,
): WebpackConfig => {
  const configuration: Object = clientConfig({ development: false });
  configuration.devtool = 'hidden-source-map';
  const scssLoaders = configuration.module.rules[1].use;
  configuration.module.rules[1].use = ExtractCssChunks.extract({
    use: scssLoaders.slice(1),
  });
  configuration.module.rules[2].use = ExtractCssChunks.extract({
    use: [
      {
        loader: 'css-loader',
        options: {
          localIdentName: '[name]__[local]--[hash:base64:5]',
        },
      },
    ],
  });
  configuration.plugins.push(
    new ExtractCssChunks(),
    new webpack.optimize.CommonsChunkPlugin({
      names: ['bootstrap'], // needed to put webpack bootstrap code before chunks
      filename: '[name].[chunkhash].js',
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
