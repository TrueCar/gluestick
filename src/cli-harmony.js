#!/usr/bin/env node
'use strict';

require("babel-core/register")({
    stage: 0,
    ignore: function(filename) {
        // ignore node modules in the current directory
        if (!/node_modules/.test(__dirname) || filename.indexOf(process.cwd()) === 0) {
            // When you run `npm start` it will run `gluestick start` but it
            // doesn't run from /usr/local/bin it actually runs it from the
            // project's node_moduls/.bin/gluestick location. For this reason
            // we cannot ignore the `cli.js` file or we wont be able to use ES6
            // in our command line interface.
            // do not skip the babel hook on the cli file
            if (/node_modules\/gluestick\/src\/cli.js/.test(filename)) return false;

            // do skip the rest of the files in node_modules
            return /node_modules/.test(filename);
        }

        // don't ignore node_modules in gluestick
        return !/\/node_modules\/gluestick\/src\//.test(filename);
    }
});

require("./cli");

