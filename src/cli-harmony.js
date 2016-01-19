#!/usr/bin/env node
'use strict';

require("babel-core/register")({
  stage: 0,
  ignore: function(filename) {
    var node_modules = "node_modules";
    var slash = process.platform === "win32" ? "\\" : "/";
    var gluestick_folder = [node_modules, "gluestick", "src"].join(slash);

    // Make sure babel does not ignore 
    if (filename.includes(gluestick_folder)) return false;

    return filename.includes(node_modules);
  }
});

require("./cli");

