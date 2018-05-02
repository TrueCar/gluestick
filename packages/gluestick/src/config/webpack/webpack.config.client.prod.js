/* @flow */
import type { WebpackConfig } from '../../types';

const webpack = require('webpack');
const path = require('path');
const clone = require('clone');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = (clientConfig: WebpackConfig): WebpackConfig => {
  const config: Object = clone(clientConfig);
  config.devtool = 'hidden-source-map';
  const scssLoaders = config.module.rules[1].use;
  config.module.rules[1].use = ExtractTextPlugin.extract({
    fallback: scssLoaders[0],
    use: scssLoaders.slice(1),
  });
  const cssLoaders = config.module.rules[2].use;
  config.module.rules[2].use = ExtractTextPlugin.extract({
    fallback: cssLoaders[0],
    use: cssLoaders.slice(1),
  });
  config.plugins.push(
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
      sourceMap: true,
    }),
    new webpack.NormalModuleReplacementPlugin(
      /gluestick\/shared\/lib\/errorUtils/,
      path.join(__dirname, './mocks/emptyObjMock.js'),
    ),
  );
  config.bail = true;
  return config;
};
