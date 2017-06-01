#!/usr/bin/env node

const babel = require('babel-core');
const glob = require('glob');
const path = require('path');
const fs = require('fs');
const mkdir = require('mkdirp');
const { execSync } = require('child_process');
const rimraf = require('rimraf');

let packageNames = [];
if (process.argv.length < 3) {
  packageNames = glob.sync('*', { cwd: path.join(process.cwd(), 'packages') });
} else {
  packageNames.push(process.argv[2]);
}

const getDestinationPath = (packageName, filename) => {
  const pathToPackage = path.join(process.cwd(), 'packages', packageName);
  return path.join(pathToPackage, filename.replace(pathToPackage, '').replace('src', 'build'));
};

packageNames.forEach((packageName) => {
  const babelrc = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'packages', packageName, '.babelrc')));
  const options = Object.assign(babelrc, {
    sourceMaps: 'inline',
  });

  rimraf.sync(path.join(process.cwd(), 'packages', packageName, 'build'));

  const globCommonOpts = {
    ignore: [
      '**/__tests__/**/*',
    ],
  };
  glob.sync(`${path.join(process.cwd(), 'packages', packageName)}/src/**/*.js`, globCommonOpts).forEach((filename) => {
    const outputFilename = getDestinationPath(packageName, filename);
    console.log(`${filename.replace(process.cwd(), '')} -> ${outputFilename.replace(process.cwd(), '')}`);
    const { code } = babel.transformFileSync(filename, options);
    mkdir.sync(path.dirname(outputFilename));
    fs.writeFileSync(outputFilename, code, 'utf-8');
  });

  glob.sync(`${path.join(process.cwd(), 'packages', packageName)}/src/**/*.{html,hbs}`, globCommonOpts).forEach((filename) => {
    const outputFilename = getDestinationPath(packageName, filename);
    console.log(`${filename.replace(process.cwd(), '')} -> ${outputFilename.replace(process.cwd(), '')}`);
    fs.createReadStream(filename).pipe(fs.createWriteStream(filename.replace('src', 'build')))
      .on('error', error => console.error(error));
  });

  if (packageName === 'gluestick-generators') {
    const command = './node_modules/.bin/flow-copy-source -v -i \'**/__tests__/**\' '
      + `./packages/${packageName}/src `
      + `./packages/${packageName}/build`;
    execSync(command);
  }
});
