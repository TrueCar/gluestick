/* @flow */

import type { WebpackConfig, UniversalWebpackConfigurator } from '../../types';

const webpack = require('webpack');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = (
  clientConfig: UniversalWebpackConfigurator,
): WebpackConfig => {
  const configuration: Object = clientConfig({ development: false });
  configuration.devtool = 'source-map';
  const scssLoaders = configuration.module.rules[1].use;
  configuration.module.rules[1].use = ExtractTextPlugin.extract({
    fallback: scssLoaders[0],
    use: scssLoaders.slice(1),
  });
  const cssLoaders = configuration.module.rules[2].use;
  configuration.module.rules[2].use = ExtractTextPlugin.extract({
    fallback: cssLoaders[0],
    use: cssLoaders.slice(1),
  });
  configuration.plugins.push(
    // Bug: some chunks are not ouptputted
    // new webpack.optimize.ModuleConcatenationPlugin(),
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
    }),
  );
  configuration.bail = true;
  return configuration;
};
