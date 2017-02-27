/* @flow */

module.exports = (plugins: Array<Object | string>, flag: string): Array<Object | string> => {
  return plugins.filter((plugin) => {
    return typeof plugin !== 'string' && plugin[flag];
  });
};
