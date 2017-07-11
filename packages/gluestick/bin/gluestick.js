#!/usr/bin/env node

if (!__dirname.startsWith(process.cwd())) {
  const red = require('chalk').red;
  console.log(
    red("It looks like you've installed the `gluestick` package globally,"),
  );
  console.log(
    red('but `gluestick` is meant to be installed locally as a dependency.'),
  );
  console.log(red('For proper functionality, please uninstall `gluestick`'));
  console.log(red('and install `gluestick-cli` globally instead.'));
  process.exit(0);
}

require('babel-polyfill');
require('../build/cli');
