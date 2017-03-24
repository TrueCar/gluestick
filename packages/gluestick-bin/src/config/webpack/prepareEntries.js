/* @flow */
import type { GSConfig } from '../../types';

const path = require('path');

module.exports = (gluestickConfig: GSConfig, entryOrGroupToBuild?: string): Object => {
  const entries = require(path.join(process.cwd(), gluestickConfig.entriesPath));

  // `/main` is a alias for `/` so it must not be used, as this will create
  // a bunch of errors down the road
  if (entries['/main']) {
    throw new Error('`/main` cannot be used as entry key, as `main` is a reserved word');
  }

  if (!entryOrGroupToBuild) {
    return entries;
  }
  const useEntryKey: boolean = entryOrGroupToBuild[0] === '/';
  return Object.keys(entries).filter((entryName: string): boolean => {
    return useEntryKey
      // Match by entry key eg: `/home`
      // `/main` should be the alias for `/`
      ? entryName === entryOrGroupToBuild || (entryName === '/' && entryOrGroupToBuild === '/main')
      // Match by group eg: `group1`
      : (
        Array.isArray(entries[entryName].group)
        && entries[entryName].group.indexOf(entryOrGroupToBuild) > -1
      );
  }).reduce((prev: Object, curr: string): Object => {
    return Object.assign(prev, { [curr]: entries[curr] });
  }, {});
};
