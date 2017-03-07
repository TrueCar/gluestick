/* @flow */

module.exports = {
  filterArg: (args: string[], argsToExclude: string[]): string[] => {
    return args.filter(arg => !argsToExclude.includes(arg));
  },
};
