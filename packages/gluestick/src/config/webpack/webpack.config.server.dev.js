/* @flow */

import type { WebpackConfig } from '../../types';

module.exports = (
  serverConfig: WebpackConfig,
  devServerPort: number,
): WebpackConfig => {
  const configuration: Object = serverConfig;
  configuration.output.publicPath = `http://localhost:${devServerPort}${configuration
    .output.publicPath}`;
  return configuration;
};
