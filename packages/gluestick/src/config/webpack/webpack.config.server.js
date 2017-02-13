/* @flow */

import type { WebpackConfig, GSConfig } from '../../types';

const { serverConfiguration } = require('universal-webpack');
const path = require('path');
const deepClone = require('./deepCopy');

module.exports = (
  configuration: WebpackConfig, settings: Object, gluestickConfig: GSConfig,
): WebpackConfig => {
  const config = deepClone(configuration);
  config.resolve.alias['project-entries'] = path.join(
    process.cwd(), gluestickConfig.entriesPath,
  );
  config.resolve.alias['entry-wrapper'] = path.join(
    process.cwd(), gluestickConfig.entryWrapperPath,
  );
  config.resolve.alias['webpack-chunks'] = path.join(
    process.cwd(), gluestickConfig.buildAssetsPath, gluestickConfig.webpackChunks,
  );
  return serverConfiguration(config, settings);
};
