/* @flow */

import type { WebpackConfig, GSConfig, Logger } from '../../types';

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
  config.name = 'server';
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
  config.resolve.alias['react-universal-component/server'] = path.join(
    process.cwd(),
    'node_modules',
    'react-universal-component',
    'server',
  );
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
  config.plugins.push(
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
  );
  config.output = {
    path: '/Users/dedmondson/src/tc/universal-gluestick/build/server',
    publicPath: '/assets/',
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    pathinfo: true,
  };
  config.entry = {
    renderer:
      '/Users/dedmondson/src/tc/universal-gluestick/node_modules/gluestick/build/renderer/entry.js',
  };
  config.target = 'node';
  config.externals = fs
    .readdirSync(path.join(process.cwd(), 'node_modules'))
    .filter(
      x => !/\.bin|react-universal-component|webpack-flush-chunks/.test(x),
    )
    .reduce((externals, mod) => {
      externals[mod] = `commonjs ${mod}`; // eslint-disable-line
      return externals;
    }, {});

  return config;
};
