#! /usr/bin/env node

const process = require("process");
const newApp = require("./commands/new");
const startClient = require("./commands/start-client");
const startServer = require("./commands/start-server");
const help = require("./commands/help");

console.log(`Capsela Web`);

const command = process.argv[2];

const scripts = {
    new: newApp,
    start: () => { startClient(); startServer(); },
    "start-client": startClient,
    "start-server": startServer,
    help: help
};

const script = scripts[command];

if (!script) {
    console.log(`invalid command "${command}"`);
    help();
    process.exit();
}

script();

