/* @flow */

import type {
  WebpackConfig,
  UniversalWebpackConfigurator,
  GSConfig,
  Logger,
  BabelOptions,
} from '../../types';

const webpack = require('webpack');
const path = require('path');
const deepClone = require('clone');
const fs = require('fs');
const DuplicatePackageChecker = require('duplicate-package-checker-webpack-plugin');
const buildEntries = require('./buildEntries');
const progressHandler = require('./progressHandler');
const chunksPlugin = require('universal-webpack/build/chunks plugin').default;
const { updateBabelLoaderConfig } = require('./utils');

module.exports = (
  logger: Logger,
  configuration: WebpackConfig,
  settings: Object,
  gluestickConfig: GSConfig,
  entries: Object,
  runtimePlugins: Object[],
  { skipEntryGeneration }: { skipEntryGeneration: boolean } = {},
): UniversalWebpackConfigurator => {
  const config = deepClone(configuration);
  // https://webpack.github.io/docs/multiple-entry-points.html
  config.entry = skipEntryGeneration ? {} : buildEntries(
    gluestickConfig, logger, entries, runtimePlugins,
  );
  config.entry = Object.keys(config.entry).reduce((prev, curr) => {
    return Object.assign(prev, {
      [curr]: [
        'babel-polyfill',
        config.entry[curr],
      ],
    });
  }, {});
  // Modify 'es2015' preset in babel-loader plugins.
  updateBabelLoaderConfig(config, (options: BabelOptions): BabelOptions => {
    return {
      ...options,
      presets: [
        ['es2015', { modules: false }],
        ...options.presets.filter(preset => preset !== 'es2015'),
      ],
    };
  });
  config.plugins.push(
    new chunksPlugin(
      deepClone(configuration),
      { silent: settings.silent, chunk_info_filename: settings.chunk_info_filename },
    ),
    // Make it so *.server.js files return null in client
    new webpack.NormalModuleReplacementPlugin(/\.server(\.js)?$/, path.join(__dirname, './mocks/serverFileMock.js')),
    progressHandler(logger, 'client'),
    new DuplicatePackageChecker(),
  );

  // If vendor Dll bundle exists, use it otherwise fallback to CommonsChunkPlugin.
  const vendorDllManifestPath = path.join(process.cwd(), gluestickConfig.buildDllPath, 'vendor-manifest.json');
  if (fs.existsSync(vendorDllManifestPath)) {
    config.plugins.unshift(
      new webpack.DllReferencePlugin({
        context: configuration.context,
        manifest: require(vendorDllManifestPath),
      }),
    );
  } else {
    config.plugins.push(
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        filename: `vendor${process.env.NODE_ENV === 'production' ? '-[hash]' : ''}.bundle.js`,
      }),
    );
  }

  return () => config;
};
