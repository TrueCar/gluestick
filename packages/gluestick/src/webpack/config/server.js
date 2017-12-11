/* @flow */

import type { ServerConfigOptions, ConfigUtils, WebpackConfig } from '../types';

const fs = require('fs');
const path = require('path');
const Config = require('webpack-config').default;
const webpack = require('webpack');

const gluestickConfig = require('../../config/defaults/glueStickConfig');
const progressHandler = require('../plugins/progressHandler');
const disableLoadersEmit = require('../utils/disableLoadersEmit');

module.exports = function createServerConfig(
  { noProgress, ...options }: ServerConfigOptions,
  { logger, ...utils }: ConfigUtils,
): WebpackConfig {
  const serverConfig = new Config()
    .merge(
      require('./base.js')({ noProgress, ...options }, { logger, ...utils }),
    )
    .merge({
      devtool: 'source-map',
      target: 'node',
      node: {
        __dirname: false,
        __filename: false,
      },
      output: {
        libraryTarget: 'commonjs2',
        filename: 'renderer.js',
        pathinfo: true,
        path: path.join(process.cwd(), gluestickConfig.buildRendererPath),
      },
      module: {
        // Disable warning for `getVersion` function from `cli/helpers.js`, which has dynamic require,
        // but it's not used by server.
        noParse: [/cli\/helpers/],
      },
      resolve: {
        alias: {
          'project-entries': path.join(
            process.cwd(),
            gluestickConfig.serverEntriesPath,
          ),
          'project-entries-config': path.join(
            process.cwd(),
            gluestickConfig.entriesPath,
          ),
          'entry-wrapper': path.join(
            process.cwd(),
            gluestickConfig.entryWrapperPath,
          ),
          'gluestick-hooks': path.join(
            process.cwd(),
            gluestickConfig.hooksPath,
          ),
          'redux-middlewares': path.join(
            process.cwd(),
            gluestickConfig.reduxMiddlewares,
          ),
          // 'plugins-config-path': gluestickConfig.pluginsConfigPath,
          'application-config': path.join(
            process.cwd(),
            gluestickConfig.sourcePath,
            gluestickConfig.configPath,
            gluestickConfig.applicationConfigPath,
          ),
          'caching-config': path.join(
            process.cwd(),
            gluestickConfig.cachingConfigPath,
          ),
        },
      },
      plugins: [
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        }),
      ].concat(noProgress ? [] : [progressHandler(logger, 'server')]),
      externals: [
        ...fs.readdirSync(path.join(process.cwd(), 'node_modules')),
        ...fs.readdirSync(path.join(__dirname, '../../../node_modules')),
      ]
        .filter(x => !/\.bin/.test(x))
        .reduce(
          (externals, resource) => ({
            ...externals,
            [resource]: `commonjs ${resource}`,
          }),
          {},
        ),
    })
    .merge(config => {
      config.module.rules
        .filter(rule => rule.test.source.includes('css'))
        .forEach(rule => {
          // eslint-disable-next-line no-param-reassign
          rule.use = ['ignore-loader'];
        });
      disableLoadersEmit(config);
    });

  return (process.env.NODE_ENV === 'production'
    ? require('../partials/serverProdTweaks.js')
    : require('../partials/serverDevTweaks.js'))(
    serverConfig,
    { noProgress, ...options },
    { logger, ...utils },
  );
};
