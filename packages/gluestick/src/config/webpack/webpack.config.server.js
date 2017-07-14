/* @flow */

import type { WebpackConfig, GSConfig, Logger } from '../../types';

const { serverConfiguration } = require('universal-webpack');
const path = require('path');
const deepClone = require('clone');
const progressHandler = require('./progressHandler');
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
    buildServerEntries(
      gluestickConfig,
      logger,
      entries,
      runtimeAndServerPlugins,
    );
  }
  const config = deepClone(configuration);
  // Disable warning for `getVersion` function from `cli/helpers.js`, which has dynamic require,
  // but it's not used by server.
  config.module.noParse = [/cli\/helpers/];
  config.module.rules[1].use = 'ignore-loader';
  config.module.rules[2].use = 'ignore-loader';
  config.resolve.alias['project-entries'] = path.join(
    process.cwd(),
    gluestickConfig.serverEntriesPath,
  );
  config.resolve.alias['project-entries-config'] = path.join(
    process.cwd(),
    gluestickConfig.entriesPath,
  );
  config.resolve.alias['entry-wrapper'] = path.join(
    process.cwd(),
    gluestickConfig.entryWrapperPath,
  );
  config.resolve.alias['gluestick-hooks'] = path.join(
    process.cwd(),
    gluestickConfig.hooksPath,
  );
  config.resolve.alias['redux-middlewares'] = path.join(
    process.cwd(),
    gluestickConfig.reduxMiddlewares,
  );
  config.resolve.alias['plugins-config-path'] =
    gluestickConfig.pluginsConfigPath;
  config.resolve.alias['application-config'] = path.join(
    config.resolve.alias.root,
    gluestickConfig.sourcePath,
    gluestickConfig.configPath,
    gluestickConfig.applicationConfigPath,
  );
  config.resolve.alias['caching-config'] = path.join(
    process.cwd(),
    gluestickConfig.cachingConfigPath,
  );
  config.plugins.push(progressHandler(logger, 'server'));
  return serverConfiguration(config, settings);
};
