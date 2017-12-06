/* @flow */

const path = require('path');
const Config = require('webpack-config').default;
const webpack = require('webpack');
const DuplicatePackageChecker = require('duplicate-package-checker-webpack-plugin');

const progressHandler = require('../plugins/progressHandler');

module.exports = (...args) => {
  const config = new Config().merge(require('./base.js')(...args)).merge({
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
  });

  return (process.env.NODE_ENV === 'production'
    ? require('../partials/applyClientProdTweaks.js')
    : require('../partials/applyClientDevTweaks.js'))(config, ...args);
};

// .merge(require('../partials/prependPolyfillEntry.js')(...args))
// .merge(require('../partials/addVendoringPlugin.js')(...args))
