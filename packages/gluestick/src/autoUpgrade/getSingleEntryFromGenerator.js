/* @flow */

module.exports = (generatorName: string, entryFileName: string, options: Object): Object => {
  // $FlowFixMe
  module.createTemplate = require('../generator/createTemplate');
  const generator: Function = require(`../generator/predefined/${generatorName}`);
  return generator(options).entries.find((entry: Object) => {
    return entry.filename === entryFileName;
  });
};
