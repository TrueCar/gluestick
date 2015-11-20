#! /usr/bin/env node
const process = require("process");

const newApp = require("./scripts/new");
const start = require("./scripts/start");
const help = require("./scripts/help");
const test = require("./scripts/test");

console.log(`Capsela Web`);

const command = process.argv[2];

const scripts = {
    new: newApp,
    start: start,
    help: help,
    test: test
};

const script = scripts[command];

if (!script) {
    console.log(`invalid command "${command}"`);
    help();
    process.exit();
}

script();

