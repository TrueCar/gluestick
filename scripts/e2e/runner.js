#!/usr/bin/env node

if (!process.env.CI_PULL_REQUEST) {
  console.log('RUNNER: build was not triggered by PR. Exiting');
  process.exit(0);
}

if (!process.env.CIRCLE_BRANCH || !process.env.CIRCLE_BRANCH.includes('next')) {
  console.log('RUNNER: E2E test can only be run in PR from `next` branch. Exiting');
  process.exit(0);
}

const PR_NUMBER = /pull\/(\d+)/.exec(process.env.CI_PULL_REQUEST)[1];

const fetch = require('node-fetch');

fetch(`http://api.github.com/repos/TrueCar/gluestick/pulls/${PR_NUMBER}`)
  .then(response => response.json())
  .then(body => {
    const baseBranch = body.base.ref;
    if (baseBranch !== 'staging') {
      console.log('RUNNER: base branch does not match \'staging\'. Exiting');
      process.exit(0);
    } else {
      console.log('RUNNER: running E2E tests...');
      require('./index.js')();
    }
  });
