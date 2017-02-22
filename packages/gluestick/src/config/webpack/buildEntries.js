/* @flow */

import type { GSConfig, Logger } from '../../types';

const glob = require('glob');
const path = require('path');
const fs = require('fs-extra');
const generator = require('../../generator');

const buildEntries = (gluestickConfig: GSConfig, logger: Logger) => {
  fs.removeSync(path.join(process.cwd(), gluestickConfig.clientEntryInitPath));
  const entries = require(path.join(process.cwd(), gluestickConfig.entriesPath));
  Object.keys(entries).forEach(entry => {
    let name = entries[entry].name || entry;
    name = name === '/' ? 'main' : name.replace('/', '');
    generator({
      generatorName: 'clientEntryInit',
      entityName: name,
      options: {
        component: entries[entry].component,
        routes: entries[entry].routes,
        clientEntryInitPath: gluestickConfig.clientEntryInitPath,
      },
    }, logger);
  });
  return glob.sync(
    path.join(process.cwd(), `${gluestickConfig.clientEntryInitPath}/**/*.js`),
  ).reduce((prev, curr) => {
    const name = path.basename(curr, '.js');
    return Object.assign(prev, { [name]: curr.replace(process.cwd(), '.') });
  }, {});
};

module.exports = buildEntries;
