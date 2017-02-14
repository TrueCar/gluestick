#!/usr/bin/env node
require('babel-register')({
  only: /gluestick.*/,
});

require('./cli');
