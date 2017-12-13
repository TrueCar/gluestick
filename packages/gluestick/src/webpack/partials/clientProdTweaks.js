/* @flow */

import type { WebpackConfig } from '../types';

const webpack = require('webpack');
const path = require('path');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = function tweakClientConfigForProd(
  baseConfig: WebpackConfig,
): WebpackConfig {
  return baseConfig
    .merge({
      devtool: 'hidden-source-map',
      plugins: [
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify('production'),
        }),
        new ExtractTextPlugin('[name]-[chunkhash].css'),
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
          path.join(__dirname, './mocks/serverFileMock.js'),
        ),
      ],
      bail: true,
    })
    .merge(config => {
      // Apply ExtractTextWebpackPlugin to CSS and SASS rules.
      config.module.rules.forEach(rule => {
        if (rule.test.source.includes('css')) {
          // eslint-disable-next-line no-param-reassign
          rule.use = ExtractTextPlugin.extract({
            fallback: rule.use[0],
            use: rule.use.slice(1),
          });
        }
      });
    });
};
