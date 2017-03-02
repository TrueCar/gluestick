/* @flow */
import type { GSConfig } from '../../types';

const path = require('path');

module.exports = (gluestickConfig: GSConfig, entryOrGroupToBuild?: string): Object => {
  const entries = require(path.join(process.cwd(), gluestickConfig.entriesPath));
  if (!entryOrGroupToBuild) {
    return entries;
  }
  return Object.keys(entries).filter((entryName: string): boolean => {
    // $FlowIgnore At this point `entryOrGroupToBuild` will be a `string`
    return entryOrGroupToBuild[0] === '/'
      // Match by entry key eg: `/home`
      // `/main` should be the alias for `/`
      ? entryName === entryOrGroupToBuild || (entryName === '/' && entryOrGroupToBuild === '/main')
      // Match by group eg: `group1`
      : entries[entryName].group === entryOrGroupToBuild;
  }).reduce((prev: Object, curr: string): Object => {
    return Object.assign(prev, { [curr]: entries[curr] });
  }, {});
};
