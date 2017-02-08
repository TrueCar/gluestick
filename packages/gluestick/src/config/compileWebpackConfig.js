/* @flow */

import type {
  Plugin,
  GSConfig,
  ProjectConfig,
  WebpackConfig,
  UniversalWebpackConfigurator,
} from '../types';

const path = require('path');
const getSharedConfig = require('./webpack/webpack.config');
const getClientConfig = require('./webpack/webpack.config.client');
const getServerConfig = require('./webpack/webpack.config.server');

module.exports = (
  plugins: Plugin[], projectConfig: ProjectConfig, gluestickConfig: GSConfig,
): WebpackConfig => {
  const env: string = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
  const universalWebpackSettings = {
    server: {
      input: path.join(__dirname, '../renderer/index.js'),
      output: path.join(process.cwd(), './build/server/server1.js'),
    },
  };
  const sharedConfig: WebpackConfig = getSharedConfig(gluestickConfig.assetsPath);
  const clientConfig: UniversalWebpackConfigurator = getClientConfig(
    sharedConfig, universalWebpackSettings,
  );
  const clientEnvConfig: WebpackConfig = require(`./webpack/webpack.config.client.${env}`)(
    clientConfig,
    gluestickConfig.ports.client,
  );
  const serverConfig: WebpackConfig = getServerConfig(sharedConfig, universalWebpackSettings);
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
