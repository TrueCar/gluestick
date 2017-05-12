/* @flow */

import type { GSConfig, Logger } from '../../types';

const glob = require('glob');
const path = require('path');
const fs = require('fs-extra');
const { highlight } = require('../../cli/colorScheme');
const generator = require('gluestick-generators').default;

const buildEntries = (
  gluestickConfig: GSConfig, logger: Logger, entries: Object, plugins: Object[],
): Object => {
  const successMessageHandler = (generatorName, entityName) => {
    logger.info(`Client entry for ${highlight(entityName)} created`);
  };

  fs.removeSync(path.join(process.cwd(), gluestickConfig.clientEntryInitPath));
  Object.keys(entries).forEach(entry => {
    let name = entries[entry].name || entry;
    name = name === '/' ? 'main' : name.replace('/', '');
    generator({
      generatorName: 'clientEntryInit',
      entityName: name,
      options: {
        component: entries[entry].component,
        routes: entries[entry].routes,
        reducers: entries[entry].reducers,
        clientEntryInitPath: gluestickConfig.clientEntryInitPath,
        config: entries[entry].config || `${gluestickConfig.configPath}/${gluestickConfig.applicationConfigPath}`,
        plugins,
      },
    }, logger, { successMessageHandler });
  });
  return glob.sync(
    path.join(process.cwd(), `${gluestickConfig.clientEntryInitPath}/**/*.js`),
  ).reduce((prev, curr) => {
    const name = path.basename(curr, '.js');
    return Object.assign(prev, { [name]: curr.replace(process.cwd(), '.') });
  }, {});
};

module.exports = buildEntries;
