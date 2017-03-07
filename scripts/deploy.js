#!/usr/bin/env node

if (process.argv.length <= 2 || !/\d+\.\d+\.\d+.*/.test(process.argv[2])) {
  console.error('Invalid version specified.');
  process.exit(1);
}

const spawn = require('cross-spawn').spawn;

// Publish packages to npm registry
spawn.sync('npm', [
  'run', 'lerna', 'publish', '--', '--repo-version', process.argv[2], '--yes',
], { stdio: 'inherit' });

console.log('Pushing tag commit...');
spawn.sync('git', ['push']);

// Create docker image and push to Docker Hub
require('./docker/create-base-image');

console.log('Done!');
