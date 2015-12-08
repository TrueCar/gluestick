#!/usr/bin/env node
'use strict';

require("babel-core/register")({stage: 0, ignore: /gluestick\/node_modules/});

require("./cli");

