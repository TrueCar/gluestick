const { execSync } = require('child_process');

const _cleanCache = () => {
  const npmVersion = execSync('npm -v').toString().trim();
  const majorVersion = npmVersion.split('.')[0];
  // As of npm@5, the npm cache self-heals from corruption issues and data extracted from the cache
  // is guaranteed to be valid.
  if (majorVersion < 5) {
    execSync('npm cache clean', { stdio: 'inherit' });
  }
};

module.exports = () => {
  execSync('rm -rf node_modules/gluestick', { stdio: 'inherit' });
  execSync('rm -rf build', { stdio: 'inherit' });
  _cleanCache();
  execSync('gluestick reinstall-dev', { stdio: 'inherit' });
};
