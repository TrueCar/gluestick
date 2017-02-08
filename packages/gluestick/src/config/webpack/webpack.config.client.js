/* @flow */

import type { WebpackConfig, UniversalWebpackConfigurator } from '../../types';

const { clientConfiguration } = require('universal-webpack');

module.exports = (configuration: WebpackConfig, settings: Object): UniversalWebpackConfigurator => {
  return options => clientConfiguration(configuration, settings, options);
};
