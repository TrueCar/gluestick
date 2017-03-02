/* @flow */

import type {
  Plugin,
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

type CompilationOptions = {
  skipClientEntryGeneration: boolean;
  skipServerEntryGeneration: boolean;
  entryOrGroupToBuild?: string;
};

module.exports = (
  logger: Logger,
  plugins: Plugin[],
  projectConfig: ProjectConfig,
  gluestickConfig: GSConfig,
  {
    skipClientEntryGeneration,
    skipServerEntryGeneration,
    entryOrGroupToBuild,
  }: CompilationOptions = {},
): CompiledConfig => {
  process.env.COMPILATION_TIMESTAMP = 'chuj';
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

  const sharedConfig: WebpackConfig = getSharedConfig(gluestickConfig);
  const clientConfig: UniversalWebpackConfigurator = getClientConfig(
    logger, sharedConfig, universalWebpackSettings, gluestickConfig, entries,
    { skipEntryGeneration: skipClientEntryGeneration },
  );
  const clientEnvConfig: WebpackConfig = require(`./webpack/webpack.config.client.${env}`)(
    clientConfig,
    gluestickConfig.ports.client,
  );
  const serverConfig: WebpackConfig = getServerConfig(
    logger, sharedConfig, universalWebpackSettings, gluestickConfig, entries,
    { skipEntryGeneration: skipServerEntryGeneration },
  );
  const serverEnvConfig: WebpackConfig = require(`./webpack/webpack.config.server.${env}`)(
    serverConfig,
    gluestickConfig.ports.client,
  );

  const clientEnvConfigFinal: WebpackConfig = plugins
    .filter((plugin: Plugin): boolean => !!plugin.body.overwriteClientWebpackConfig)
    .reduce((prev: Object, plugin: Plugin) => {
      return plugin.body.overwriteClientWebpackConfig
        // $FlowIgnore
        ? plugin.body.overwriteClientWebpackConfig(clone(prev))
        : prev;
    }, clientEnvConfig);
  const serverEnvConfigFinal: WebpackConfig = plugins
    .filter((plugin: Plugin): boolean => !!plugin.body.overwriteServerWebpackConfig)
    .reduce((prev: Object, plugin: Plugin) => {
      return plugin.body.overwriteServerWebpackConfig
        // $FlowIgnore
        ? plugin.body.overwriteServerWebpackConfig(clone(prev))
        : prev;
    }, serverEnvConfig);

  return {
    universalSettings: universalWebpackSettings,
    client: clientEnvConfigFinal,
    server: serverEnvConfigFinal,
  };
};
