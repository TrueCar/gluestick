/* @flow */

const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const Config = require('webpack-config').default;
const deepClone = require('clone');

const ChunksPlugin = require('../plugins/ChunksPlugin');
const gluestickConfig = require('../../config/defaults/glueStickConfig');
const { manifestFilename } = require('../../config/vendorDll');

module.exports = (baseConfig, _, { logger }) =>
  new Config().merge(config => {
    // If vendor Dll bundle exists, use it otherwise fallback to CommonsChunkPlugin.
    const vendorDllManifestPath: string = path.join(
      process.cwd(),
      gluestickConfig.buildDllPath,
      manifestFilename,
    );
    if (fs.existsSync(vendorDllManifestPath)) {
      logger.info('Vendor DLL bundle found, using DllReferencePlugin');
      config.plugins.unshift(
        new webpack.DllReferencePlugin({
          context: config.context,
          manifest: require(vendorDllManifestPath),
        }),
      );
      config.plugins.push(
        new ChunksPlugin(deepClone(config), { appendChunkInfo: true }),
      );
    } else {
      logger.info('Vendor DLL bundle not found, using CommonsChunkPlugin');
      config.plugins.push(
        new webpack.optimize.CommonsChunkPlugin({
          name: 'vendor',
          filename: `vendor${process.env.NODE_ENV === 'production'
            ? '-[hash]'
            : ''}.bundle.js`,
        }),
        new ChunksPlugin(deepClone(config)),
      );
    }
  });
