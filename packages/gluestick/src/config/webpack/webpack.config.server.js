/* @flow */

import type { WebpackConfig, GSConfig, Logger } from '../../types';

const { serverConfiguration } = require('universal-webpack');
const path = require('path');
const deepClone = require('./deepCopy');
const generator = require('../../generator');

const buildServerEntries = (gluestickConfig: GSConfig, logger: Logger) => {
  const entries = require(path.join(process.cwd(), gluestickConfig.entriesPath));
  generator({
    generatorName: 'serverEntries',
    entityName: path.basename(gluestickConfig.serverEntriesPath),
    options: {
      serverEntriesPath: path.dirname(gluestickConfig.serverEntriesPath),
      entries: Object.keys(entries).map(entry => {
        return {
          path: entry,
          name: entries[entry].name || (entry === '/' ? 'main' : entry.replace('/', '')),
          component: entries[entry].component,
          routes: entries[entry].routes,
          reducers: entries[entry].reducers,
        };
      }),
    },
  }, logger);
};

module.exports = (
  logger: Logger, configuration: WebpackConfig, settings: Object, gluestickConfig: GSConfig,
): WebpackConfig => {
  buildServerEntries(gluestickConfig, logger);
  const config = deepClone(configuration);
  config.resolve.alias['project-entries'] = path.join(
    process.cwd(), gluestickConfig.serverEntriesPath,
  );
  config.resolve.alias['entry-wrapper'] = path.join(
    process.cwd(), gluestickConfig.entryWrapperPath,
  );
  config.resolve.alias['webpack-chunks'] = path.join(
    process.cwd(), gluestickConfig.buildAssetsPath, gluestickConfig.webpackChunks,
  );
  return serverConfiguration(config, settings);
};
