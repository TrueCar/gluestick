const path = require('path');
const spawn = require('cross-spawn');

module.exports = exitWithError => {
  let gsDeps = null;
  let gsPackages = [];
  try {
    gsDeps = require(path.join(process.cwd(), 'package.json')).dependencies;
    gsPackages = Object.keys(gsDeps).filter(
      e => /^gluestick/.test(e) && !/\d+\.\d+\.\d+.*/.test(gsDeps[e]),
    );
  } catch (error) {
    exitWithError(error.message);
  }
  gsPackages.forEach(e => {
    spawn('npm', ['install', gsDeps[e]], { stdio: 'inherit' });
  });
};
