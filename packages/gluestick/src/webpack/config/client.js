/* @flow */

const path = require('path');
const Config = require('webpack-config').default;
const webpack = require('webpack');
const DuplicatePackageChecker = require('duplicate-package-checker-webpack-plugin');

const progressHandler = require('../plugins/progressHandler');
const addVendoringPlugin = require('../partials/addVendoringPlugin.js');

module.exports = (...args) => {
  const clientConfig = new Config()
    .merge(require('./base.js')(...args))
    .merge({
      plugins: [
        // Make it so *.server.js files return null in client
        new webpack.NormalModuleReplacementPlugin(
          /\.server(\.js)?$/,
          path.join(__dirname, '../../config/webpack/mocks/serverFileMock.js'),
        ),
        new DuplicatePackageChecker(),
      ].concat(
        args[0].noProgress ? [] : [progressHandler(args[1].logger, 'client')],
      ),
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
    ? require('../partials/applyClientProdTweaks.js')
    : require('../partials/applyClientDevTweaks.js'))(
    addVendoringPlugin(clientConfig, ...args),
    ...args,
  );
};
