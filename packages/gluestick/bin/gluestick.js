#!/usr/bin/env node

if (!__dirname.startsWith(process.cwd())) {
  const red = require('chalk').red;
  console.log(red('It look like you\'ve installed `gluestick` package globally,'));
  console.log(red('but `gluestick` is ment to be installed locally as a dependency.'));
  console.log(red('To ensure everything works correctly, please uninstall `gluestick`'));
  console.log(red('and install globally `gluestick-cli`.'));
  process.exit(0);
}

require('./compile');
require('../src/cli');
