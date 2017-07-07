const babel = require('babel-core');
const fs = require('fs');
const { join } = require('path');

function getBabelRc(path) {
  const packageName = /packages\/([^/]+)\//.exec(path)[1];
  const pathToBabelRc = join(__dirname, 'packages', packageName, '.babelrc');
  return Object.assign({ retainLines: true }, JSON.parse(fs.readFileSync(pathToBabelRc)));
}

module.exports = {
  process(src, path) {
    if (/\.js$/.test(path)) {
      return babel.transform(src, getBabelRc(path));
    }
    return src;
  },
};
