#!/usr/bin/env node
'use strict';

require("babel-core/register")({
  stage: 0,
  ignore: function(filename) {
    // ignore node modules in the current directory
    if (!/node_modules/.test(__dirname) || filename.indexOf(process.cwd()) === 0) {
      // don't ignore node_modules in gluestick
      if (/node_modules\/gluestick\/src\//.test(filename)) return false;

          // do skip the rest of the files in node_modules
          return /node_modules/.test(filename);
    }

    // don't ignore node_modules in gluestick
    return !/\/node_modules\/gluestick\/src\//.test(filename);
  }
});

require("./cli");

