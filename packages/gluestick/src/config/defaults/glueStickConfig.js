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
  publicPath: '/assets/',
  buildStaticPath: 'build/static',
  buildAssetsPath: 'build/assets',
  buildRendererPath: 'build/server',
  buildDllPath: 'build/assets/dlls',
  assetsPath: 'assets',
  sourcePath: 'src',
  appsPath: 'apps',
  sharedPath: 'shared',
  configPath: 'config',
  applicationConfigPath: 'application',
  entryWrapperPath: 'gluestick/EntryWrapper',
  clientEntryInitPath: 'gluestick/clientEntryInit',
  serverEntriesPath: 'gluestick/entries',
  entriesPath: 'src/entries.json',
  reduxMiddlewares: 'src/config/redux-middleware',
  webpackChunks: 'webpack-chunks.json',
  webpackStats: 'build/webpack-stats',
  proxyLogLevel: 'info',
  debugWatchDirectories: [
    path.join(process.cwd(), 'src/**/*.js'),
    path.join(process.cwd(), 'node_modules/gluestick/**/*'),
  ],
  customErrorTemplatePath: path.join(process.cwd(), 'gluestick', '500.hbs'),
  defaultErrorTemplatePath: path.join(__dirname, '../../renderer/500.hbs'),
  gluestickConfigPath: 'src/gluestick.config.js',
  hooksPath: 'src/gluestick.hooks.js',
  webpackHooksPath: 'src/webpack.hooks.js',
  cachingConfigPath: 'src/config/caching.server',
  vendorSourcePath: 'src/vendor.js',
  nodeModulesPath: 'node_modules',
  autoUpgrade: {
    added: [
      'src/config/application.js', // -> prior to 0.1.6
      'src/config/webpack-additions.js', // -> prior to 0.1.12
      'src/config/redux-middleware.js', // -> prior to 0.1.12
      'src/config/.Dockerfile', // -> prior to 0.2.0
      '.dockerignore', // -> prior to 0.3.6
      'src/config/init.browser.js', // -> prior to 0.9.26
      // From V2
      'gluestick/EntryWrapper.js',
      'src/entries.json',
      'src/gluestick.plugins.js',
      'src/gluestick.hooks.js',
      'src/webpack.hooks.js',
      'src/config/caching.server.js',
      // 1.x
      'src/gluestick.config.js',
      'src/vendor.js',
    ],
    changed: [
      'src/config/.Dockerfile', // -> last updated in 0.2.0
      'gluestick/EntryWrapper.js',
    ],
  },
};

module.exports = config;
