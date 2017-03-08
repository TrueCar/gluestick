#!/usr/bin/env node

if (process.argv.length <= 2 || !/\d+\.\d+\.\d+.*/.test(process.argv[2])) {
  console.error('Invalid version specified.');
  process.exit(1);
}

const version = process.argv[2];
const spawn = require('cross-spawn');
const glob = require('glob');
const path = require('path');
const fs = require('fs');

const spawnWithErrorHandling = (...args) => {
  const results = spawn.sync(...args);
  if (results.error) {
    throw results.error;
  }
};

// Update gluestick-* dependecies in packages
const packages = glob.sync('./packages/*', { cwd: process.cwd() });
const updateGluestickDeps = (deps) => {
  const updatedDeps = deps;
  packages.forEach((packagePath) => {
    const name = path.basename(packagePath);
    if (updatedDeps[name]) {
      updatedDeps[name] = version;
    }
  });
  return updatedDeps;
};
packages.forEach((packagePath) => {
  const filePath = path.join(process.cwd(), packagePath, 'package.json');
  const packageJSON = require(filePath);
  if (packageJSON.dependencies) {
    packageJSON.dependencies = updateGluestickDeps(packageJSON.dependencies);
  }
  if (packageJSON.devDependencies) {
    packageJSON.devDependencies = updateGluestickDeps(packageJSON.devDependencies);
  }
  fs.writeFileSync(filePath, `${JSON.stringify(packageJSON, null, '  ')}\n`, 'utf-8');
});

// Publish packages to npm registry
spawnWithErrorHandling('npm', [
  'run', 'lerna', 'publish', '--', '--repo-version', version, '--yes',
], { stdio: 'inherit' });

console.log('Pushing tag commit...');
spawnWithErrorHandling('git', ['push']);

// Create docker image and push to Docker Hub
require('./docker/create-base-image')(spawnWithErrorHandling);

console.log('Done!');
