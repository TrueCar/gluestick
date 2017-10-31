/* @flow */

import type { WebpackConfig } from '../../types';

module.exports = (serverConfig: WebpackConfig): WebpackConfig => ({
  ...serverConfig,
  resolve: {
    ...serverConfig.resolve,
    alias: {
      ...(serverConfig.resolve ? serverConfig.resolve.alias : {}),
      react: require.resolve('react/dist/react.js'),
      'react-dom/server': require.resolve('react-dom/dist/react-dom-server.js'),
      'react-dom': require.resolve('react-dom/dist/react-dom.js'),
    },
  },
  bail: true,
});
