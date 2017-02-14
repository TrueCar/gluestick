/* @flow */

import type { WebpackConfig, UniversalWebpackConfigurator, GSConfig, Logger } from '../../types';

const { clientConfiguration } = require('universal-webpack');
const deepClone = require('./deepCopy');
const buildEntries = require('./buildEntries');

module.exports = (
  logger: Logger, configuration: WebpackConfig, settings: Object, gluestickConfig: GSConfig,
): UniversalWebpackConfigurator => {
  const config = deepClone(configuration);
  // https://webpack.github.io/docs/multiple-entry-points.html
  config.entry = buildEntries(gluestickConfig, logger);
  return options => clientConfiguration(config, settings, options);
};
