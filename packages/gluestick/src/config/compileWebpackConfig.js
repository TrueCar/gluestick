/* @flow */

import type {
  ConfigPlugin,
  RuntimePlugin,
  GSConfig,
  ProjectConfig,
  WebpackConfig,
  UniversalWebpackConfigurator,
  Logger,
  UniversalSettings,
  CompiledConfig,
} from '../types';

const path = require('path');
const clone = require('clone');
const getSharedConfig = require('./webpack/webpack.config');
const getClientConfig = require('./webpack/webpack.config.client');
const getServerConfig = require('./webpack/webpack.config.server');
const prepareEntries = require('./webpack/prepareEntries');
const prepareRuntimeEntries = require('../plugins/prepareRuntimePlugins');

type CompilationOptions = {
  skipClientEntryGeneration: boolean;
  skipServerEntryGeneration: boolean;
  entryOrGroupToBuild?: string;
};

module.exports = (
  logger: Logger,
  plugins: ConfigPlugin[],
  projectConfig: ProjectConfig,
  gluestickConfig: GSConfig,
  {
    skipClientEntryGeneration,
    skipServerEntryGeneration,
    entryOrGroupToBuild,
  }: CompilationOptions = {},
): CompiledConfig => {
  const env: string = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
  const universalWebpackSettings: UniversalSettings = {
    server: {
      input: path.join(__dirname, '../renderer/entry.js'),
      output: path.join(process.cwd(), './build/server/renderer.js'),
    },
  };

  const entries: Object = skipClientEntryGeneration && skipServerEntryGeneration
    ? {}
    : prepareEntries(gluestickConfig, entryOrGroupToBuild);

  // $FlowIgnore
  const runtimePlugins: RuntimePlugin = skipClientEntryGeneration && skipServerEntryGeneration
    ? []
    : prepareRuntimeEntries(logger, gluestickConfig.pluginsConfigPath);
  const sharedConfig: WebpackConfig = getSharedConfig(gluestickConfig);
  // $FlowIgnore
  const clientConfig: UniversalWebpackConfigurator = getClientConfig(
    logger, sharedConfig, universalWebpackSettings, gluestickConfig, entries, runtimePlugins,
    { skipEntryGeneration: skipClientEntryGeneration },
  );
  const clientEnvConfig: WebpackConfig = require(`./webpack/webpack.config.client.${env}`)(
    clientConfig,
    gluestickConfig.ports.client,
  );
  // $FlowIgnore
  const serverConfig: WebpackConfig = getServerConfig(
    logger, sharedConfig, universalWebpackSettings, gluestickConfig, entries, runtimePlugins,
    { skipEntryGeneration: skipServerEntryGeneration },
  );
  const serverEnvConfig: WebpackConfig = require(`./webpack/webpack.config.server.${env}`)(
    serverConfig,
    gluestickConfig.ports.client,
  );

  const clientEnvConfigFinal: WebpackConfig = plugins
    .filter((plugin: ConfigPlugin): boolean => !!plugin.overwrites.clientWebpackConfig)
    .reduce((prev: Object, plugin: ConfigPlugin) => {
      return plugin.overwrites.clientWebpackConfig
        // $FlowIgnore
        ? plugin.overwrites.clientWebpackConfig(clone(prev))
        : prev;
    }, clientEnvConfig);
  const serverEnvConfigFinal: WebpackConfig = plugins
    .filter((plugin: ConfigPlugin): boolean => !!plugin.overwrites.serverWebpackConfig)
    .reduce((prev: Object, plugin: ConfigPlugin) => {
      return plugin.overwrites.serverWebpackConfig
        // $FlowIgnore
        ? plugin.overwrites.serverWebpackConfig(clone(prev))
        : prev;
    }, serverEnvConfig);

  return {
    universalSettings: universalWebpackSettings,
    client: clientEnvConfigFinal,
    server: serverEnvConfigFinal,
  };
};
