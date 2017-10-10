const { execSync } = require('child_process');

const _cleanCache = () => {
  const npmVersion = execSync('npm -v').toString().trim();
  const majorVersion = npmVersion.split('.')[0];
  // Force npm@5
  execSync(`npm cache clean${majorVersion >= 5 ? ' --force' : ''}`, {
    stdio: 'inherit',
  });
};

module.exports = () => {
  execSync('rm -rf node_modules/gluestick', { stdio: 'inherit' });
  execSync('rm -rf build', { stdio: 'inherit' });
  _cleanCache();
  execSync('gluestick reinstall-dev', { stdio: 'inherit' });
};
