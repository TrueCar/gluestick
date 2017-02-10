/* @flow */

import type { WebpackConfig } from '../../types';
const webpack = require('webpack');

const deepClone = (obj: Object) => {
  const output: Object = {};
  for (const key in obj) {
    const value: any = obj[key];
    if (Array.isArray(value)) {
      output[key] = value.slice();
    } else {
      output[key] = (typeof value === 'object') ? deepClone(value) : value;
    }
  }
  return output;
};

module.exports = (serverConfig: WebpackConfig, devServerPort: number): WebpackConfig => {
  const configuration: Object = deepClone(serverConfig);
  configuration.plugins.push(
    new webpack.DefinePlugin({
      'process.env': {
        COMPILATION_TIMESTAMP: JSON.stringify(new Date().toISOString()),
      },
    }),
  );
  configuration.output.publicPath = `http://localhost:${devServerPort}${
    configuration.output.publicPath}`;
  return configuration;
};
