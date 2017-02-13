/* @flow */

import type { GSConfig } from '../../types';

const path = require('path');

const config: GSConfig = {
  protocol: 'http',
  host: '0.0.0.0',
  ports: {
    client: 8888,
    server: 8880,
  },
  buildAssetsPath: 'build/assets',
  assetsPath: 'assets',
  sourcePath: 'src',
  actionsPath: 'actions',
  componentsPath: 'components',
  containersPath: 'containers',
  reducersPath: 'reducers',
  routesPath: 'routes',
  configPath: 'config',
  proxyLogLevel: 'info',
  debugWatchDirectories: [
    path.join(process.cwd(), 'src/**/*.js'),
    path.join(process.cwd(), 'node_modules/gluestick/**/*'),
  ],
};

module.exports = config;
