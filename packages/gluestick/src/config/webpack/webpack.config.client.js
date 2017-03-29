/* @flow */

import type { WebpackConfig, UniversalWebpackConfigurator, GSConfig, Logger } from '../../types';

const { clientConfiguration } = require('universal-webpack');
const deepClone = require('clone');
const buildEntries = require('./buildEntries');

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
  return () => config;
};
