/* @flow */

const path = require('path');

module.exports = (generatorPath: string, entryFileName: string, options: Object): Object => {
  // $FlowFixMe
  module.createTemplate = require('gluestick-generators').createTemplate;
  const generator: Function = require(generatorPath);
  const compiledGenerator = generator(options);
  return compiledGenerator.entry
    ? compiledGenerator.entry
    : compiledGenerator.entries.find((entry: Object) => {
      return (
        entry.filename === entryFileName ||
        `${entry.filename}${path.extname(entryFileName)}` === entryFileName
      );
    });
};
