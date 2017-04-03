/* @flow */

import type { WebpackConfig, UniversalWebpackConfigurator, GSConfig, Logger } from '../../types';

const webpack = require('webpack');
const path = require('path');
const deepClone = require('clone');
const buildEntries = require('./buildEntries');
const chunksPlugin = require('universal-webpack/build/chunks plugin').default;

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
        'eventsource-polyfill',
        config.entry[curr],
      ],
    });
  }, {});
  config.plugins.push(
    new chunksPlugin(
      deepClone(configuration),
      { silent: settings.silent, chunk_info_filename: settings.chunk_info_filename },
    ),
    // Make it so *.server.js files return null in client
    new webpack.NormalModuleReplacementPlugin(/\.server(\.js)?$/, path.join(__dirname, "./mocks/serverFileMock.js")),
  );
  return () => config;
};
