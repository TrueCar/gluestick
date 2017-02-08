/* @flow */

import type { WebpackConfig, UniversalWebpackConfigurator } from '../../types';


const webpack = require('webpack');

module.exports = (clientConfig: UniversalWebpackConfigurator): WebpackConfig => {
  const configuration: Object = clientConfig({ development: false });
  configuration.devtool = 'source-map';
  configuration.plugins.push(
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
      },
      REDUX_DEVTOOLS: false,
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
  return configuration;
};

