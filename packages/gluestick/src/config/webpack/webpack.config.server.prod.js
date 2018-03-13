/* @flow */

import type { WebpackConfig } from '../../types';

module.exports = (serverConfig: WebpackConfig): WebpackConfig => ({
  ...serverConfig,
  resolve: {
    ...serverConfig.resolve,
    alias: {
      ...(serverConfig.resolve ? serverConfig.resolve.alias : {}),
      react: require.resolve('react/cjs/react.production.min.js'),
      'react-dom/server': require.resolve(
        'react-dom/cjs/react-dom-server.node.production.min.js',
      ),
      'react-dom': require.resolve('react-dom/cjs/react-dom.production.min.js'),
    },
  },
  bail: true,
});
