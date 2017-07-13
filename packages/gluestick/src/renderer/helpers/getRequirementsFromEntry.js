/* @flow */

import type {
  Context,
  Request,
  Entries,
  RenderRequirements,
} from '../../types';

const parseURL = require('url').parse;
const isChildPath = require('./isChildPath');
/**
 * Sort through all of the entry points based on the number of `/` characters
 * found in the url. It will test the most deeply nested entry points first
 * while finally falling back to the default index parameter.
 */
const getSortedEntries = (entries: Entries): string[] => {
  return Object.keys(entries).sort((a, b) => {
    const bSplitLength: number = b.split('/').length;
    const aSplitLength: number = a.split('/').length;
    if (bSplitLength === aSplitLength) {
      return b.length - a.length;
    }
    return bSplitLength - aSplitLength;
  });
};

/**
 * This method takes the server request object, determines which entry point
 * the server should use for rendering and then prepares the necessary
 * variables that the server needs to render. These variables include Index,
 * store, getRoutes and fileName.
 */
module.exports = (
  { config, logger }: Context,
  req: Request,
  entries: Entries,
): RenderRequirements => {
  const { path: urlPath } = parseURL(req.url);
  const sortedEntries: string[] = getSortedEntries(entries);

  /**
   * Loop through the sorted entry points and return the variables that the
   * server needs to render based on the best matching entry point.
   */
  const entryName:
    | string
    | void = sortedEntries.find((entryPath: string): boolean => {
    return isChildPath(entryPath, urlPath || '');
  });

  if (entryName) {
    logger.debug(`Found entry for path ${entryName}`);
  }
  if (!entryName) {
    throw new Error(`No matching entry definition found for '${req.url}'`);
  }

  return {
    Component: entries[entryName].component,
    reducers: entries[entryName].reducers,
    routes: entries[entryName].routes,
    config: entries[entryName].config || null,
    name: entries[entryName].name || entryName,
    key: entryName,
  };
};
