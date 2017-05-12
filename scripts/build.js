#!/usr/bin/env node

const babel = require('babel-core');
const glob = require('glob');
const path = require('path');
const fs = require('fs');
const mkdir = require('mkdirp');

let packageNames = [];
if (process.argv.length < 3) {
  packageNames = glob.sync('*', { cwd: path.join(process.cwd(), 'packages') });
} else {
  packageNames.push(process.argv[2]);
}

packageNames.forEach((packageName) => {
  const babelrc = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'packages', packageName, '.babelrc')));
  const options = Object.assign(babelrc, {
    sourceMaps: 'inline',
  });

  glob.sync(`${path.join(process.cwd(), 'packages', packageName)}/src/**/*.js`, {
    ignore: [
      '**/__tests__/**/*',
    ],
  }).forEach((filename) => {
    const outputFilename = filename.replace('src', 'build');
    console.log(`${filename.replace(process.cwd(), '')} -> ${outputFilename.replace(process.cwd(), '')}`);
    const { code } = babel.transformFileSync(filename, options);
    mkdir.sync(path.dirname(outputFilename));
    fs.writeFileSync(outputFilename, code, 'utf-8');
  });
});
