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
};

module.exports = config;
