const path = require('path');
const getSharedConfig = require('./webpack/webpack.config');
const getClientConfig = require('./webpack/webpack.config.client');
const getServerConfig = require('./webpack/webpack.config.server');

module.exports = (plugins, projectConfig, GSConfig) => {
  const env = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
  const universalWebpackSettings = {
    server: {
      input: path.join(__dirname, '../renderer/index.js'),
      output: path.join(process.cwd(), './build/server/server1.js'),
    },
  };
  const sharedConfig = getSharedConfig(GSConfig.assetsPath);
  const clientConfig = getClientConfig(sharedConfig, universalWebpackSettings);
  const clientEnvConfig = require(`./webpack/webpack.config.client.${env}`)(
    clientConfig,
    GSConfig.ports.client,
  );
  const serverConfig = getServerConfig(sharedConfig, universalWebpackSettings);
  const serverEnvConfig = require(`./webpack/webpack.config.server.${env}`)(
    serverConfig,
    GSConfig.ports.client,
  );
  return {
    universalSettings: universalWebpackSettings,
    client: clientEnvConfig,
    server: serverEnvConfig,
  };
};
