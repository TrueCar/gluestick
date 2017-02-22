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

type CompilationOptions = {
  skipClientEntryGeneration: boolean;
  skipServerEntryGeneration: boolean;
};

module.exports = (
  logger: Logger,
  plugins: Plugin[],
  projectConfig: ProjectConfig,
  gluestickConfig: GSConfig,
  { skipClientEntryGeneration, skipServerEntryGeneration }: CompilationOptions = {},
): CompiledConfig => {
  const env: string = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
  const universalWebpackSettings: UniversalSettings = {
    server: {
      input: path.join(__dirname, '../renderer/entry.js'),
      output: path.join(process.cwd(), './build/server/renderer.js'),
    },
  };
  const sharedConfig: WebpackConfig = getSharedConfig(gluestickConfig);
  const clientConfig: UniversalWebpackConfigurator = getClientConfig(
    logger, sharedConfig, universalWebpackSettings, gluestickConfig,
    { skipEntryGeneration: skipClientEntryGeneration },
  );
  const clientEnvConfig: WebpackConfig = require(`./webpack/webpack.config.client.${env}`)(
    clientConfig,
    gluestickConfig.ports.client,
  );
  const serverConfig: WebpackConfig = getServerConfig(
    logger, sharedConfig, universalWebpackSettings, gluestickConfig,
    { skipEntryGeneration: skipServerEntryGeneration },
  );
  const serverEnvConfig: WebpackConfig = require(`./webpack/webpack.config.server.${env}`)(
    serverConfig,
    gluestickConfig.ports.client,
  );

  const clientEnvConfigOverides: Object = plugins
    .filter((plugin: Plugin): boolean => !!plugin.body.overwriteClientWebpackConfig)
    .reduce((prev: Object, plugin: Plugin) => {
      return Object.assign(
        prev,
        plugin.body.overwriteClientWebpackConfig(clone(clientEnvConfig)),
      );
    }, {});
  const serverEnvConfigOverides: Object = plugins
    .filter((plugin: Plugin): boolean => !!plugin.body.overwriteServerWebpackConfig)
    .reduce((prev: Object, plugin: Plugin) => {
      return Object.assign(
        prev,
        plugin.body.overwriteServerWebpackConfig(clone(serverEnvConfig)),
      );
    }, {});

  return {
    universalSettings: universalWebpackSettings,
    client: Object.assign(clientEnvConfig, clientEnvConfigOverides),
    server: Object.assign(serverEnvConfig, serverEnvConfigOverides),
  };
};
