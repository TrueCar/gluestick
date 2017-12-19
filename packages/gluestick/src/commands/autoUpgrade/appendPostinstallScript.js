/* @flow */

const fs = require('fs');
const path = require('path');

module.exports = function appendPostinstallScript() {
  const packageJsonFilename = path.join(process.cwd(), 'package.json');
  const packageJson = require(packageJsonFilename);
  let shouldOverwrite = false;

  if (!packageJson.scripts.postinstall) {
    packageJson.scripts.postinstall = 'gluestick auto-upgrade';
    shouldOverwrite = true;
  } else if (
    !packageJson.scripts.postinstall.includes('gluestick auto-upgrade')
  ) {
    packageJson.scripts.postinstall += ' && gluestick auto-upgrade';
    shouldOverwrite = true;
  }

  if (shouldOverwrite) {
    fs.writeFileSync(
      packageJsonFilename,
      JSON.stringify(packageJson, null, '  '),
    );
  }
};
