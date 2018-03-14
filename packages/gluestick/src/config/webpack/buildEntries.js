/* @flow */

import type { GSConfig, Logger } from '../../types';

const path = require('path');
const { highlight } = require('../../cli/colorScheme');
const generator = require('gluestick-generators').default;

const buildEntries = (
  gluestickConfig: GSConfig,
  logger: Logger,
  entries: Object,
  plugins: Object[],
): Object => {
  const successMessageHandler = (generatorName, entityName) => {
    logger.info(`Client entry for ${highlight(entityName)} created`);
  };

  const appNames = [];
  Object.keys(entries).forEach(entry => {
    let name = entries[entry].name || entry;
    name = name === '/' ? 'main' : name.replace('/', '');
    appNames.push(name);
    generator(
      {
        generatorName: 'clientEntryInit',
        entityName: name,
        options: {
          component: entries[entry].component,
          routes: entries[entry].routes,
          reducers: entries[entry].reducers,
          clientEntryInitPath: gluestickConfig.clientEntryInitPath,
          config:
            entries[entry].config ||
            `${gluestickConfig.configPath}/${gluestickConfig.applicationConfigPath}`,
          plugins,
          enableErrorOverlay: gluestickConfig.enableErrorOverlay,
        },
      },
      logger,
      { successMessageHandler },
    );
  });

  return appNames.reduce((prev, curr) => {
    return {
      ...prev,
      [curr]: `./${path.join(gluestickConfig.clientEntryInitPath, curr)}`,
    };
  }, {});
};

module.exports = buildEntries;
