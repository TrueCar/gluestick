/* @flow */

module.exports = (
  plugins: Array<Object>,
  flag: string,
  invert: boolean = false,
): Array<Object> => {
  return plugins.filter(plugin => {
    const baseCheck = typeof plugin !== 'string' && plugin[flag];
    return invert ? !baseCheck : baseCheck;
  });
};
