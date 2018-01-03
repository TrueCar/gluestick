/* @flow */

import type { WebpackConfig } from '../types';

module.exports = function tweakServerConfigForProd(
  baseConfig: WebpackConfig,
): WebpackConfig {
  return baseConfig.merge({
    bail: true,
  });
};
