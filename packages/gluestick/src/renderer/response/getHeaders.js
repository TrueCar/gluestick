/* @flow */

module.exports = function getHeaders(route: {
  headers: Object | Function,
}): Object | null {
  if (!{}.hasOwnProperty.call(route, 'headers')) {
    return null;
  }

  return typeof route.headers === 'function' ? route.headers() : route.headers;
};
