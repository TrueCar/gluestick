#!/usr/bin/env node

var spawn = require('cross-spawn').spawn;
var fs = require('fs');

var version = JSON.parse(fs.readFileSync("./package.json")).version;
var tag = "truecar/gluestick:" + version;

spawn.sync("docker", ["build", "-f", "./docker/Dockerfile", "--force-rm=true", "-t", tag, "--build-arg", "GLUESTICK_VERSION=" + version, "."], {stdio: "inherit", env: Object.assign({}, process.env)});
spawn.sync("docker", ["push", tag], {stdio: "inherit", env: Object.assign({}, process.env)});
