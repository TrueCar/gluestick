/* @flow */

import type { WebpackConfig } from '../../types';

const { serverConfiguration } = require('universal-webpack');

module.exports = (configuration: WebpackConfig, settings: Object): WebpackConfig => {
  return serverConfiguration(configuration, settings);
};
