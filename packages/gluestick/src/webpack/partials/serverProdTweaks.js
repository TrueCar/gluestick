/* @flow */

import type { WebpackConfig } from '../types';

module.exports = function tweakServerConfigForProd(
  baseConfig: WebpackConfig,
): WebpackConfig {
  return baseConfig.merge({
    bail: true,
    resolve: {
      alias: {
        react: require.resolve('react/dist/react.js'),
        'react-dom/server': require.resolve(
          'react-dom/dist/react-dom-server.js',
        ),
        'react-dom': require.resolve('react-dom/dist/react-dom.js'),
      },
    },
  });
};
