const path = require('path');
const spawn = require('cross-spawn');

module.exports = (exitWithError) => {
  let gsPath = null;
  try {
    gsPath = require(path.join(process.cwd(), 'package.json')).dependencies.gluestick;
  } catch (error) {
    exitWithError(error.message);
  }
  spawn(
    'npm',
    ['install', gsPath],
    { stdio: 'inherit' },
  );
};
