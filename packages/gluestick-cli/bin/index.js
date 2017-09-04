#!/usr/bin/env node

const commander = require('../build/cli').default;

commander.parse(process.argv);
