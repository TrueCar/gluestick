/* @flow */

import type { WebpackConfig, GSConfig, Logger } from '../../types';

const { serverConfiguration } = require('universal-webpack');
const path = require('path');
const deepClone = require('clone');
const buildServerEntries = require('./buildServerEntries');

module.exports = (
  logger: Logger,
  configuration: WebpackConfig,
  settings: Object,
  gluestickConfig: GSConfig,
  { skipEntryGeneration }: { skipEntryGeneration: boolean } = {},
): WebpackConfig => {
  if (!skipEntryGeneration) {
    buildServerEntries(gluestickConfig, logger);
  }
  const config = deepClone(configuration);
  config.resolve.alias['project-entries'] = path.join(
    process.cwd(), gluestickConfig.serverEntriesPath,
  );
  config.resolve.alias['project-entries-config'] = path.join(
    process.cwd(), gluestickConfig.entriesPath,
  );
  config.resolve.alias['entry-wrapper'] = path.join(
    process.cwd(), gluestickConfig.entryWrapperPath,
  );
  config.resolve.alias['webpack-chunks'] = path.join(
    process.cwd(), gluestickConfig.buildAssetsPath, gluestickConfig.webpackChunks,
  );
  config.resolve.alias['redux-middlewares'] = path.join(
    process.cwd(), gluestickConfig.reduxMiddlewares,
  );
  return serverConfiguration(config, settings);
};
