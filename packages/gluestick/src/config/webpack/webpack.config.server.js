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
  entries: Object,
  runtimeAndServerPlugins: Object[],
  { skipEntryGeneration }: { skipEntryGeneration: boolean } = {},
): WebpackConfig => {
  if (!skipEntryGeneration) {
    buildServerEntries(gluestickConfig, logger, entries, runtimeAndServerPlugins);
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
  config.resolve.alias['gluestick-hooks'] = path.join(
    process.cwd(), gluestickConfig.hooksPath,
  );
  config.resolve.alias['redux-middlewares'] = path.join(
    process.cwd(), gluestickConfig.reduxMiddlewares,
  );
  config.resolve.alias['plugins-config-path'] = gluestickConfig.pluginsConfigPath;
  config.resolve.alias['build-assets'] = path.join(
    config.resolve.alias.root, gluestickConfig.buildAssetsPath,
  );
  return serverConfiguration(config, settings);
};
