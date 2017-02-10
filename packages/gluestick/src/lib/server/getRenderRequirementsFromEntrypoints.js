import { parse as parseURL } from 'url';
// import { getHttpClient } from 'gluestick-shared';
import isChildPath from '../isChildPath';

const entries = require('config/entries').default;
/**
 * Sort through all of the entry points based on the number of `/` characters
 * found in the url. It will test the most deeply nested entry points first
 * while finally falling back to the default index parameter.
 */
const getSortedEntries = () => {
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
export default (req, res, config = {}, logger) => {
  // const httpClient = getHttpClient(config.httpClient, req, res);
  const { path: urlPath } = parseURL(req.url);
  const sortedEntries = getSortedEntries();
  logger.debug('Getting webpack entries');

  /**
   * Loop through the sorted entry points and return the variables that the
   * server needs to render based on the best matching entry point.
   */
  logger.debug('Looping through sorted entry points');
  for (const path of sortedEntries) {
    if (isChildPath(path, urlPath)) {
      logger.debug(`Found entrypoint and performing requires for path "${path}"`);
      return {
        Component: entries[path].component,
        reducer: entries[path].reducer,
        routes: entries[path].routes,
      };
    }
  }

  return null;
};
