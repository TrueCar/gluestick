/* @flow */

import type { WebpackConfig, GSConfig, Logger } from '../../types';

const { serverConfiguration } = require('universal-webpack');
const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
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
  {
    skipEntryGeneration,
    noProgress,
  }: { skipEntryGeneration: boolean, noProgress: boolean } = {},
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
  if (!noProgress) {
    config.plugins.push(progressHandler(logger, 'server'));
  }
  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
  );
  const universal = serverConfiguration(config, settings);

  // universal-webpack's way of doing externals doesn't account for aliases and breaks react-universal-component.
  // This instead builds the list of externals ahead of time by looking through the node_modules folder.
  universal.externals = fs
    .readdirSync(path.join(process.cwd(), 'node_modules'))
    .filter(
      x => !/\.bin|react-universal-component|webpack-flush-chunks/.test(x),
    )
    .reduce((externals, mod) => {
      externals[mod] = `commonjs ${mod}`; // eslint-disable-line no-param-reassign
      return externals;
    }, {});

  return universal;
};
