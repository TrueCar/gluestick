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
const DuplicatePackageChecker = require('duplicate-package-checker-webpack-plugin');
const buildEntries = require('./buildEntries');
const progressHandler = require('./progressHandler');
const { updateBabelLoaderConfig } = require('./utils');

module.exports = (
  logger: Logger,
  configuration: WebpackConfig,
  settings: Object,
  gluestickConfig: GSConfig,
  entries: Object,
  runtimePlugins: Object[],
  {
    skipEntryGeneration,
    noProgress,
  }: { skipEntryGeneration: boolean, noProgress: boolean } = {},
): UniversalWebpackConfigurator => {
  const config = deepClone(configuration);
  // https://webpack.github.io/docs/multiple-entry-points.html
  config.entry = skipEntryGeneration
    ? {}
    : buildEntries(gluestickConfig, logger, entries, runtimePlugins);
  config.entry = Object.keys(config.entry).reduce((prev, curr) => {
    return Object.assign(prev, {
      [curr]: ['babel-polyfill', config.entry[curr]],
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
    // Make it so *.server.js files return null in client
    new webpack.NormalModuleReplacementPlugin(
      /\.server(\.js)?$/,
      path.join(__dirname, './mocks/nullMock.js'),
    ),
    new DuplicatePackageChecker(),
  );

  if (!noProgress) {
    config.plugins.push(progressHandler(logger, 'client'));
  }

  return () => config;
};
