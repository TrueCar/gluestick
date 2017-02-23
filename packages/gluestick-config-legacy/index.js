const path = require('path');
const webpack = require('webpack');

const applicationServer = require(
  path.join(process.cwd(), 'src/config/application.server.js'),
).default;

module.exports = (options, { logger }) => {
  return {
    overwriteGluestickConfig: (config) => {
      const gluestickConfig = config;
      gluestickConfig.protocol = applicationServer.protocol;
      gluestickConfig.host = applicationServer.host;
      gluestickConfig.ports.client = applicationServer.port;
      gluestickConfig.ports.server = applicationServer.assetPort;
      console.log(config);
      return gluestickConfig;
    },
    //overwriteClientWebpackConfig: overwriteConfig,
    //overwriteServerWebpackConfig: overwriteConfig,
  };
};
