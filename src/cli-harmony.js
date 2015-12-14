#!/usr/bin/env node
'use strict';

require("babel-core/register")({
    stage: 0,
    ignore: function(filename) {
        // ignore node modules in the current directory
        if (filename.indexOf(process.cwd()) === 0) {
            return /node_modules/.test(filename);
        }

        // don't ignore node_modules in gluestick
        return !/\/dev\/gluestick\/src\//.test(filename);
    }
});

require("./cli");

