#!/usr/bin/env node

const spawn = require('cross-spawn').spawn;

// Publish packages to npm registry
spawn.sync('npm', [
  'run', 'lerna', 'publish', '--', '--repo-version', process.argv[2], '--yes', '--skip-npm',
], { stdio: 'inherit' });
spawn.sync('git', ['push']);
// Create docker image and push to Docker Hub
require('./docker/create-base-image');
