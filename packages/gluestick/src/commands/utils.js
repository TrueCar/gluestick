/* @flow */

module.exports = {
  filterArg: (args: string[], argToExclude: string): string[] => {
    return args.filter(arg => arg !== `--${argToExclude}`);
  },
};
