#!/usr/bin/env node

const spawn = require('cross-spawn').spawn;
const version = require('../../lerna.json').version;

const tag = `truecar/gluestick:${version}`;

console.log('Building docer image...');
spawn.sync('docker', [
  'build',
  '-f', './docker/Dockerfile',
  '--force-rm=true',
  '-t', tag,
  '--build-arg', `GLUESTICK_VERSION=${version}`,
  '.',
], { stdio: 'inherit', env: Object.assign({}, process.env) });

console.log('Pushing image to Docker Hub...');
spawn.sync('docker', ['push', tag], { stdio: 'inherit', env: Object.assign({}, process.env) });
