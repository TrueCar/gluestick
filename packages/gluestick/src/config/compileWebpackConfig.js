/* @flow */

import type {
  Plugin,
  GSConfig,
  ProjectConfig,
  WebpackConfig,
  UniversalWebpackConfigurator,
  Logger,
} from '../types';

const path = require('path');
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
): WebpackConfig => {
  const env: string = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
  const universalWebpackSettings = {
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
  return {
    universalSettings: universalWebpackSettings,
    client: clientEnvConfig,
    server: serverEnvConfig,
  };
};
