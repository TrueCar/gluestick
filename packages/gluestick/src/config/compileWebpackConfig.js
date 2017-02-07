const path = require('path');
const getSharedConfig = require('./webpack/webpack.config');
const getClientConfig = require('./webpack/webpack.config.client');
const getClientDevConfig = require('./webpack/webpack.config.client.dev');
const getServerConfig = require('./webpack/webpack.config.server');
const getServerDevConfig = require('./webpack/webpack.config.server.dev');

module.exports = (plugins, projectConfig, GSConfig) => {
  const universalWebpackSettings = {
    server: {
      input: path.join(__dirname, '../renderer/index.js'),
      output: path.join(process.cwd(), './build/server/server1.js'),
    },
  };
  const sharedConfig = getSharedConfig(GSConfig.assetsPath);
  const clientConfig = getClientConfig(sharedConfig, universalWebpackSettings);
  const clientDevConfig = getClientDevConfig(clientConfig, GSConfig.ports.client);
  const serverConfig = getServerConfig(sharedConfig, universalWebpackSettings);
  const serverDevConfig = getServerDevConfig(serverConfig, GSConfig.ports.client);
  return {
    universalSettings: universalWebpackSettings,
    client: {
      dev: clientDevConfig,
    },
    server: {
      dev: serverDevConfig,
    },
  };
};
