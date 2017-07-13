/* @flow */

import type { GSConfig, Logger } from '../../types';

const path = require('path');
const generator = require('gluestick-generators').default;

const buildServerEntries = (
  gluestickConfig: GSConfig,
  logger: Logger,
  entries: Object,
  plugins: Object[],
): void => {
  const successMessageHandler = () => {
    logger.info('Server entries created');
  };
  generator(
    {
      generatorName: 'serverEntries',
      entityName: path.basename(gluestickConfig.serverEntriesPath),
      options: {
        serverEntriesPath: path.dirname(gluestickConfig.serverEntriesPath),
        entries: Object.keys(entries).map(entry => {
          return {
            path: entry,
            name:
              entries[entry].name ||
              (entry === '/' ? 'main' : entry.replace('/', '')),
            explicitName: entries[entry].name,
            component: entries[entry].component,
            routes: entries[entry].routes,
            reducers: entries[entry].reducers,
            config: entries[entry].config,
          };
        }),
        plugins,
      },
    },
    logger,
    { successMessageHandler },
  );
};

module.exports = buildServerEntries;
