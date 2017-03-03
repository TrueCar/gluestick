const { execSync } = require('child_process');
const path = require('path');

let gsDeps = null;
let gsPackages = [];

gsDeps = require(path.join(process.cwd(), 'package.json')).dependencies;
gsPackages = Object.keys(gsDeps).filter(
  (e => /^gluestick/.test(e) && !/\d+\.\d+\.\d+.*/.test(gsDeps[e])));

module.exports = () => {
  gsPackages.forEach(e => {
    execSync(
      `rm -rf node_modules/${e}`,
      { stdio: 'inherit' },
    );
  });
  execSync(
    'rm -rf build',
    { stdio: 'inherit' },
  );
  execSync(
    'npm cache clean',
    { stdio: 'inherit' },
  );
  execSync(
    'gluestick reinstall-dev',
    { stdio: 'inherit' },
  );
};
