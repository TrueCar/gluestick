/* @flow */

const _files = {};

module.exports = {
  closeSync: () => {},
  openSync: (file: string) => {
    _files[file] = true;
  },
  existsSync: (file: string) => {
    return !!_files[file];
  },
  statSync: (file: string) => {
    if (!_files[file]) {
      throw new Error('File does not exist!');
    }
    return true;
  },
  unlinkSync: (file: string) => {
    _files[file] = false; // Faster than destroy and ok for testing purposes
  },
  writeFileSync: () => {
    // @TODO, implement when implementing skipped test from destroy.test.js
  },
};
