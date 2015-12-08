#!/usr/bin/env node
'use strict';

require("babel-core/register")({
    stage: 0,
    ignore: function(filename) {
        return !/\/node_modules\/gluestick\/src\//.test(filename);
    }
});

require("./cli");

