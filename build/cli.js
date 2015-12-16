"use strict";

var fs = require("fs");
var process = require("process");
var spawn = require("child_process").spawn;
var newApp = require("./commands/new");
var startClient = require("./commands/start-client");
var startServer = require("./commands/start-server");
var startTest = require("./commands/test");
var generate = require("./commands/generate");
var help = require("./commands/help");
var chalk = require("chalk");

var command = process.argv[2];
var isProduction = process.env.NODE_ENV === "production";

var scripts = {
    "new": newApp,
    start: startAll,
    test: spawnProcess.bind(null, "test"),
    generate: generate,
    "start-test": startTest,
    "start-client": startClient,
    "start-server": startServer,
    help: help
};

var script = scripts[command];

if (!script) {
    console.log("invalid command \"" + command + "\"");
    help();
    process.exit();
}

function spawnProcess(type) {
    var childProcess;
    switch (type) {
        case "client":
            childProcess = spawn("gluestick", ["start-client"], { stdio: "inherit", env: Object.assign({}, process.env) });
            break;
        case "server":
            childProcess = spawn("gluestick", ["start-server"], { stdio: "inherit", env: Object.assign({}, process.env, { NODE_ENV: isProduction ? "production" : "development-server" }) });
            break;
        case "test":
            childProcess = spawn("gluestick", ["start-test"], { stdio: "inherit", env: Object.assign({}, process.env, { NODE_ENV: isProduction ? "production" : "development-test" }) });
            break;
    }

    childProcess.on("error", function (data) {
        console.log(chalk.red(JSON.stringify(arguments)));
    });
    return childProcess;
}

function startAll() {
    var client = spawnProcess("client");
    var server = spawnProcess("server");
    //var testProcess = spawnProcess("test");

    // We do not want to watch for changes in production
    if (isProduction) return;

    console.log("watching", process.cwd());
    var changedTimer;
    fs.watch(process.cwd(), { recursive: true }, function (event, filename) {
        clearTimeout(changedTimer);
        changedTimer = setTimeout(function () {
            console.log(chalk.yellow("[change detected] restarting server…", filename));
            server.kill();
            server = spawnProcess("server");
        }, 500);
    });
}

script();