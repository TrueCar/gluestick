#!/usr/bin/env node

if (process.argv.length <= 2 || !/\d+\.\d+\.\d+.*/.test(process.argv[2])) {
  console.error('Invalid version specified.');
  process.exit(1);
}

const version = process.argv[2];
const spawn = require('cross-spawn');

const spawnWithErrorHandling = (...args) => {
  const results = spawn.sync(...args);
  if (results.error) {
    throw results.error;
  }
};

// Publish packages to npm registry
spawnWithErrorHandling('npm', [
  'run',
  'lerna',
  'publish',
  '--',
  '--repo-version',
  version,
  '--yes',
  '--force-publish=*',
  '--skip-git',
], { stdio: 'inherit' });

console.log('Pushing commit...');
spawnWithErrorHandling('git', ['add', '.']);
spawnWithErrorHandling('git', ['commit', '-m', `v${version}`]);
spawnWithErrorHandling('git', ['push', 'origin', process.env.BRANCH]);

// Create docker image and push to Docker Hub
// require('./docker/create-base-image')(spawnWithErrorHandling);

console.log('Done!');
