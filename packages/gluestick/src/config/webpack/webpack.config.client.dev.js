/* @flow */

import type { WebpackConfig, UniversalWebpackConfigurator } from '../../types';

const webpack = require('webpack');

module.exports = (
  clientConfig: UniversalWebpackConfigurator, devServerPort: number,
): WebpackConfig => {
  const configuration: Object = clientConfig({ development: true, css_bundle: true });
  configuration.plugins.push(
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
        BABEL_ENV: JSON.stringify('development/client'),
      },
      REDUX_DEVTOOLS: false, // enable/disable redux-devtools
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.LoaderOptionsPlugin({
      test: /\.(scss|css)$/,
      debug: true,
    }),
  );
  configuration.entry = Object.keys(configuration.entry).reduce((prev, curr) => {
    return Object.assign(prev, {
      [curr]: [
        `webpack-hot-middleware/client?path=http://localhost:${devServerPort}/__webpack_hmr`,
        'webpack/hot/only-dev-server',
        configuration.entry[curr],
      ],
    });
  }, {});
  configuration.module.rules[0].use[0].options.plugins.push([
    'react-transform',
    {
      transforms: [{
        transform: 'react-transform-hmr',
        imports: ['react'],
        locals: ['module'],
      }],
    },
  ]);
  configuration.output.publicPath = `http://localhost:${devServerPort}${configuration.output.publicPath}`;
  // https://github.com/webpack/webpack/issues/3486
  configuration.performance = { hints: false };
  return configuration;
};

