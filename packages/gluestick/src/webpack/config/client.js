/* @flow */

import type { ClientConfigOptions, ConfigUtils, WebpackConfig } from '../types';

const path = require('path');
const Config = require('webpack-config').default;
const webpack = require('webpack');
const DuplicatePackageChecker = require('duplicate-package-checker-webpack-plugin');

const progressHandler = require('../plugins/progressHandler');
const addVendoringPlugin = require('../partials/addVendoringPlugin.js');
const gluestickConfig = require('../../config/defaults/glueStickConfig');

module.exports = function createClientConfig(
  { noProgress, ...options }: ClientConfigOptions,
  { logger, ...utils }: ConfigUtils,
): WebpackConfig {
  const { buildAssetsPath, publicPath } = gluestickConfig;
  const outputPath: string = path.resolve(process.cwd(), buildAssetsPath);

  const clientConfig = new Config()
    .merge(require('./base.js')(options))
    .merge({
      output: {
        // filesystem path for static files
        path: outputPath,
        // network path for static files
        publicPath: `/${publicPath}/`.replace(/\/\//g, '/'),
        // file name pattern for entry scripts
        filename: '[name].[hash].js',
        // file name pattern for chunk scripts
        chunkFilename: '[name].[hash].js',
      },
      plugins: [
        // Make it so *.server.js files return null in client
        new webpack.NormalModuleReplacementPlugin(
          /\.server(\.js)?$/,
          path.join(__dirname, '../mocks/serverFileMock.js'),
        ),
        new DuplicatePackageChecker(),
      ].concat(noProgress ? [] : [progressHandler(logger, 'client')]),
    })
    .merge(config => {
      // eslint-disable-next-line no-param-reassign
      config.entry = Object.keys(config.entry).reduce((prev, curr) => {
        return Object.assign(prev, {
          [curr]: ['babel-polyfill', config.entry[curr]],
        });
      }, {});
    });

  return (process.env.NODE_ENV === 'production'
    ? require('../partials/clientProdTweaks.js')
    : require('../partials/clientDevTweaks.js'))(
    addVendoringPlugin(
      clientConfig,
      { noProgress, ...options },
      { logger, ...utils },
    ),
  );
};
