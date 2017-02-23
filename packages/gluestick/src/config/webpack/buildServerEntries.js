/* @flow */

import type { GSConfig, Logger } from '../../types';

const path = require('path');
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
          explicitName: entries[entry].name,
          component: entries[entry].component,
          routes: entries[entry].routes,
          reducers: entries[entry].reducers,
        };
      }),
    },
  }, logger);
};

module.exports = buildServerEntries;
