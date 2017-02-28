/* @flow */

module.exports = (
  plugins: Array<Object | string>,
  flag: string,
  invert: boolean = false,
): Array<Object | string> => {
  return plugins.filter((plugin) => {
    const baseCheck = typeof plugin !== 'string' && plugin[flag];
    return invert ? !baseCheck : baseCheck;
  });
};
