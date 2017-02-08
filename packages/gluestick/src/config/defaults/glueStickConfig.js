/* @flow */

import type { GSConfig } from '../../types';

const config: GSConfig = {
  protocol: 'http',
  host: '0.0.0.0',
  ports: {
    client: 8888,
    server: 8880,
  },
  assetsPath: 'build/assets',
  proxyLogLevel: 'info',
};

module.exports = config;
