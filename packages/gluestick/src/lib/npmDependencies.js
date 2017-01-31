import path from 'path';
import rimraf from 'rimraf';
import { which } from 'shelljs';

const spawn = require('cross-spawn').spawn;

const IS_WINDOWS = process.platform === 'win32';

function install() {
  if (which('yarn') !== null) {
    return spawn.sync('yarn', { stdio: 'inherit' });
  }

  const postFix = IS_WINDOWS ? '.cmd' : '';
  return spawn.sync(`npm${postFix}`, ['install'], { stdio: 'inherit' });
}

function cleanSync() {
  // wipe the existing node_modules folder so we can have a clean start
  rimraf.sync(path.join(process.cwd(), 'node_modules'));
  spawn.sync('npm', ['cache', 'clean'], { stdio: 'inherit' });
}

module.exports = {
  cleanSync,
  install,
};
