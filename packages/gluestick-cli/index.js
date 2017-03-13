#!/usr/bin/env node
require('babel-register')({
  ignore: /node_modules\/(?!gluestick.*)/,
  presets: [
    'es2015',
    'stage-0',
  ],
  plugins: [
    'transform-flow-strip-types',
  ],
  babelrc: false,
});

require('./cli');
