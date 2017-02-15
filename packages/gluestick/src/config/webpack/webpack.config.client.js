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
  { skipEntryGeneration }: { skipEntryGeneration: boolean } = {},
): UniversalWebpackConfigurator => {
  const config = deepClone(configuration);
  // https://webpack.github.io/docs/multiple-entry-points.html
  config.entry = skipEntryGeneration ? {} : buildEntries(gluestickConfig, logger);
  return options => clientConfiguration(config, settings, options);
};

module.exports = (
  logger: Logger, configuration: WebpackConfig, settings: Object, gluestickConfig: GSConfig,
): UniversalWebpackConfigurator => {
  const config = deepClone(configuration);
  // https://webpack.github.io/docs/multiple-entry-points.html
  config.entry = buildEntries(gluestickConfig, logger);
  return options => clientConfiguration(config, settings, options);
};
