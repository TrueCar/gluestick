#! /usr/bin/env node

const process = require("process");
const spawn = require("child_process").spawn;
const newApp = require("./commands/new");
const startClient = require("./commands/start-client");
const startServer = require("./commands/start-server");
const help = require("./commands/help");
const chalk = require("chalk");

const command = process.argv[2];

console.log(`Capsela Web: ${command}`);

function logIt (prefix, type, data) {
    var output = prefix + ": " + data.toString("utf8").replace(/\n$/, "");
    switch (type) {
        case "error":
            output = chalk.red(output);
            break;
        case "close":
            output = chalk.yellow("Closed with code: " + data);
    }
    console.log(output);
}

function startBoth () {
    const client = spawn("cweb", ["start-client"], {stdio: "inherit", env: Object.assign({}, process.env)});
    const server = spawn("cweb", ["start-server"], {stdio: "inherit", env: Object.assign({}, process.env, {NODE_ENV: "production"})});
    [client, server].forEach((item, i) => {
        const prefix = i === 0 ? "CLIENT" : "SERVER";
        item.on("close", logIt.bind(null, prefix, "close"))
        item.on("error", function (data) { console.log(arguments) });
    });
}

const scripts = {
    new: newApp,
    start: startBoth,
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

