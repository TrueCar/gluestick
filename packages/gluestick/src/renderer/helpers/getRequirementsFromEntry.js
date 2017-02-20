const parseURL = require('url').parse;
const isChildPath = require('./isChildPath')
;
/**
 * Sort through all of the entry points based on the number of `/` characters
 * found in the url. It will test the most deeply nested entry points first
 * while finally falling back to the default index parameter.
 */
const getSortedEntries = (entries) => {
  return Object.keys(entries).sort((a, b) => {
    const bSplitLength = b.split('/').length;
    const aSplitLength = a.split('/').length;
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
module.exports = ({ config, logger }, req, entries) => {
  const { path: urlPath } = parseURL(req.url);
  const sortedEntries = getSortedEntries(entries);

  /**
   * Loop through the sorted entry points and return the variables that the
   * server needs to render based on the best matching entry point.
   */
  const entryName = sortedEntries.find(entryPath => {
    return isChildPath(entryPath, urlPath);
  });

  if (entryName) {
    logger.debug(`Found entry for path ${entryName}`);
  }
  return entryName ? {
    Component: entries[entryName].component,
    reducers: entries[entryName].reducers,
    routes: entries[entryName].routes,
    name: entries[entryName].name || entryName,
  } : null;
};
