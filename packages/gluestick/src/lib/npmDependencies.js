const path = require('path');
const rimraf = require('rimraf');
// const { which } = require('shelljs');
const spawn = require('cross-spawn').spawn;

/**
 * TODO: uncomment lines after bugs with yarn are fixed
 * https://github.com/TrueCar/gluestick/issues/528
 */

const install = () => {
  // if (which('yarn') !== null) {
  //   spawn.sync('yarn', { stdio: 'inherit' });
  // }

  spawn.sync('npm', ['install'], { stdio: 'inherit' });
};

const cleanSync = () => {
  // wipe the existing node_modules folder so we can have a clean start
  rimraf.sync(path.join(process.cwd(), 'node_modules'));
  spawn.sync('npm', ['cache', 'clean'], { stdio: 'inherit' });
};

module.exports = {
  cleanSync,
  install,
};
