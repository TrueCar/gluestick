const { execSync } = require('child_process');

module.exports = () => {
  execSync('rm -rf node_modules/gluestick', { stdio: 'inherit' });
  execSync('rm -rf build', { stdio: 'inherit' });
  execSync('npm cache clean', { stdio: 'inherit' });
  execSync('gluestick reinstall-dev', { stdio: 'inherit' });
};
