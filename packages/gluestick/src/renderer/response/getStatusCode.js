/* @flow */

const { ROUTE_NAME_404_NOT_FOUND } = require('../../../shared');

module.exports = (store: Object, currentRoute: Object): number => {
  const state = store.getState();
  // Check if status code was set in redux
  if (
    state._gluestick.statusCode &&
    typeof state._gluestick.statusCode === 'number'
  ) {
    return state._gluestick.statusCode;
  } else if (state._gluestick.statusCode) {
    throw new Error('_gluestick.statusCode must be a number');
  }

  // Check if this is the 404 route
  // @deprecate in favor of route level status
  if (currentRoute.name === ROUTE_NAME_404_NOT_FOUND) {
    return 404;
  } else if (currentRoute.status) {
    // Check for something like <Route status={404} />
    return currentRoute.status;
  }

  return 200;
};
