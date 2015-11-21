#! /usr/bin/env node

const process = require("process");
const newApp = require("./commands/new");
const start = require("./commands/start");
const help = require("./commands/help");

console.log(`Capsela Web`);

const command = process.argv[2];

const scripts = {
    new: newApp,
    start: start,
    help: help
};

const script = scripts[command];

if (!script) {
    console.log(`invalid command "${command}"`);
    help();
    process.exit();
}

script();

