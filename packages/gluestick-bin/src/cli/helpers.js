const path = require('path');

module.exports = {
  parseBooleanFlag: value => ['false', '0', 'no'].includes(value),
  getVersion: () => require(path.join(__dirname, '../../', 'package.json')).version,
};
