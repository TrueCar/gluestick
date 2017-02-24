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
  appsPath: 'apps',
  sharedPath: 'shared',
  configPath: 'config',
  entryWrapperPath: 'gluestick/EntryWrapper',
  clientEntryInitPath: 'gluestick/clientEntryInit',
  serverEntriesPath: 'gluestick/entries',
  entriesPath: 'src/entries.json',
  webpackChunks: 'webpack-chunks.json',
  proxyLogLevel: 'info',
  debugWatchDirectories: [
    path.join(process.cwd(), 'src/**/*.js'),
    path.join(process.cwd(), 'node_modules/gluestick/**/*'),
  ],
  customErrorTemplatePath: path.join(process.cwd(), 'gluestick', '500.hbs'),
  defaultErrorTemplatePath: path.join(__dirname, '../../renderer/500.hbs'),
  hooksPath: 'src/gluestick.hooks.js',
  autoUpgrade: {
    added: [
      'src/config/application.js',        // -> prior to 0.1.6
      'src/config/webpack-additions.js',  // -> prior to 0.1.12
      'src/config/redux-middleware.js',   // -> prior to 0.1.12
      'src/config/.Dockerfile',           // -> prior to 0.2.0
      '.dockerignore',                    // -> prior to 0.3.6
      'src/config/init.browser.js',       // -> prior to 0.9.26
      // From V2
      'gluestick/500.hbs',
      'gluestick/EntryWrapper.js',
      'src/entries.json',
      'src/gluestick.plugins.js',
      'src/gluestick.hooks.js',
      'src/apps/main/Index.js',
      'src/apps/main/routes.js',
      'src/apps/main/reducers/index.js',
      'src/apps/main/components/Home.js',
      'src/apps/main/components/MasterLayout.js',
      'src/apps/main/components/__tests__/Home.test.js',
      'src/apps/main/components/__tests__/MasterLayout.test.js',
      'src/apps/main/containers/HomeApp.js',
      'src/apps/main/containers/NoMatchApp.js',
      'src/apps/main/containers/__tests__/HomeApp.test.js',
      'src/apps/main/containers/__tests__/NoMatchApp.test.js',
    ],
    changed: [
      'src/config/.Dockerfile',   // -> last updated in 0.2.0
    ],
  },
};

module.exports = config;
