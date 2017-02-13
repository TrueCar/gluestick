/* @flow */

import type { WebpackConfig, UniversalWebpackConfigurator } from '../../types';

const { clientConfiguration } = require('universal-webpack');
const deepClone = require('./deepCopy');

module.exports = (configuration: WebpackConfig, settings: Object): UniversalWebpackConfigurator => {
  return options => clientConfiguration(deepClone(configuration), settings, options);
};
