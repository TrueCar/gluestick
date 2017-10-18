#!/usr/bin/env node

const crossSpawn = require('cross-spawn');
const version = require('../../lerna.json').version.replace('v', '');

const tag = `truecar/gluestick:${version}`;
console.log(`Creating Docker base image for ${tag}`);

module.exports = (spawn = crossSpawn) => {
  console.log('Building docker image...');
 spawn('docker', [
    'build',
    '-f', './scripts/docker/Dockerfile',
    '--force-rm=true',
    '-t', tag,
    '--build-arg', `GLUESTICK_VERSION=${version}`,
    '.',
  ], { stdio: 'inherit', env: Object.assign({}, process.env) });

  console.log('Pushing image to Docker Hub...');
  spawn('docker', ['push', tag], { stdio: 'inherit', env: Object.assign({}, process.env) });
};
