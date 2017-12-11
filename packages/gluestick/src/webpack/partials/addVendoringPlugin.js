/* @flow */

import type { ClientConfigOptions, ConfigUtils, WebpackConfig } from '../types';

const path = require('path');
const fs = require('fs');
const webpack = require('webpack');

const ChunksPlugin = require('../plugins/ChunksPlugin');
const gluestickConfig = require('../../config/defaults/glueStickConfig');
const { manifestFilename } = require('../../config/vendorDll');

module.exports = function addVendoringPlugin(
  baseConfig: WebpackConfig,
  _: ClientConfigOptions,
  { logger }: ConfigUtils,
): WebpackConfig {
  return baseConfig.merge(config => {
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
      config.plugins.push(new ChunksPlugin(config, { appendChunkInfo: true }));
    } else {
      logger.info('Vendor DLL bundle not found, using CommonsChunkPlugin');
      config.plugins.push(
        new webpack.optimize.CommonsChunkPlugin({
          name: 'vendor',
          filename: `vendor${process.env.NODE_ENV === 'production'
            ? '-[hash]'
            : ''}.bundle.js`,
        }),
        new ChunksPlugin(config),
      );
    }
  });
};
