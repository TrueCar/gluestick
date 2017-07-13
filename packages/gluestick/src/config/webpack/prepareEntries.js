/* @flow */
import type { GSConfig } from '../../types';

const path = require('path');
const { convertToCamelCase } = require('../../utils');

module.exports = (
  gluestickConfig: GSConfig,
  appOrGroupToBuild?: string,
): Object => {
  const entries = require(path.join(
    process.cwd(),
    gluestickConfig.entriesPath,
  ));

  // `/main` is a alias for `/` so it must not be used, as this will create
  // a bunch of errors down the road
  if (entries['/main']) {
    throw new Error(
      '`/main` cannot be used as entry key, as `main` is a reserved word',
    );
  }

  if (!appOrGroupToBuild) {
    return entries;
  }

  const singleApp: boolean = appOrGroupToBuild[0] === '/';
  const appOrGroupName: string = convertToCamelCase(
    appOrGroupToBuild.replace(/^\//, ''),
  );
  const entriesToBuild: string[] = Object.keys(
    entries,
  ).filter((entryKey: string): boolean => {
    if (singleApp && entries[entryKey].name) {
      // If `name` property is defined
      return entries[entryKey].name === appOrGroupName;
    } else if (singleApp && entryKey === '/') {
      // If `name` is not defined, check if entry is a index entry
      return appOrGroupName === 'main';
    } else if (singleApp) {
      // Fallback: convert entryKey to camelCase and compare with passed value
      return convertToCamelCase(entryKey.replace(/^\//, '')) === appOrGroupName;
    }

    return (
      Array.isArray(entries[entryKey].group) &&
      entries[entryKey].group.findIndex((groupName: string) => {
        return convertToCamelCase(groupName) === appOrGroupName;
      }) > -1
    );
  });

  if (!entriesToBuild.length) {
    throw new Error('No matching entry found');
  }

  return entriesToBuild.reduce((prev: Object, curr: string): Object => {
    return { ...prev, [curr]: entries[curr] };
  }, {});
};
