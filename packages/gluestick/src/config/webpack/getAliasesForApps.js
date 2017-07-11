/* @flow */
import type { GSConfig } from '../../types';

const path = require('path');
const fs = require('fs');

type EntryAlias = {
  name: string,
  path: string,
};

module.exports = (gluestickConfig: GSConfig): { [key: string]: string } => {
  const entries: { [key: string]: Object } = require(path.join(
    process.cwd(),
    gluestickConfig.entriesPath,
  ));
  return Object.keys(entries)
    .map((entry: string): EntryAlias => {
      const name: string =
        entries[entry].name || (entry === '/' ? 'main' : entry.substr(1));
      const pathMatch = /(.*apps\/[^/]+)/.exec(entries[entry].component);
      let appPath: string =
        pathMatch && pathMatch.length > 1
          ? path.join(process.cwd(), pathMatch[1])
          : '';
      if (!pathMatch || !pathMatch.length === 0) {
        // Check if the app exist using name
        const testAppPath: string = path.join(
          process.cwd(),
          gluestickConfig.sourcePath,
          gluestickConfig.appsPath,
          name,
        );
        appPath = fs.existsSync(testAppPath) ? testAppPath : '';
      } else if (!pathMatch[1].includes(name)) {
        // Double check if path to app is valid
        const testAppPath: string = path.join(process.cwd(), pathMatch[1]);
        appPath = fs.existsSync(testAppPath) ? testAppPath : '';
      }
      return {
        name,
        path: appPath,
      };
    })
    .filter((entryAlias: EntryAlias) => entryAlias.path.length)
    .reduce(
      (prev: Object, curr: EntryAlias) => ({ ...prev, [curr.name]: curr.path }),
      {},
    );
};
