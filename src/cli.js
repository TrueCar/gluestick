const fs = require("fs");
const process = require("process");
const spawn = require("child_process").spawn;
const newApp = require("./commands/new");
const startClient = require("./commands/start-client");
const startServer = require("./commands/start-server");
const startTest = require("./commands/test");
const generate = require("./commands/generate");
const help = require("./commands/help");
const chalk = require("chalk");

const command = process.argv[2];
const isProduction = process.env.NODE_ENV === "production";

const scripts = {
    new: newApp,
    start: startAll,
    test: spawnProcess.bind(null, "test"),
    generate: generate,
    "start-test": startTest,
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

function spawnProcess (type) {
    var childProcess;
    switch (type) {
        case "client":
            childProcess = spawn("gluestick", ["start-client"], {stdio: "inherit", env: Object.assign({}, process.env)});
            break;
        case "server":
            childProcess = spawn("gluestick", ["start-server"], {stdio: "inherit", env: Object.assign({}, process.env, {NODE_ENV: isProduction ? "production": "development-server"})});
            break;
        case "test":
            childProcess = spawn("gluestick", ["start-test"], {stdio: "inherit", env: Object.assign({}, process.env, {NODE_ENV: isProduction ? "production": "development-test"})});
            break;
    }

    childProcess.on("error", function (data) { console.log(chalk.red(JSON.stringify(arguments))) });
    return childProcess;
}

function startAll() {
    var client = spawnProcess("client");
    var server = spawnProcess("server");

    // Start tests unless they asked us not to
    // @TODO: would be better to use something like `commander` for these things
    if (process.argv[3] !== "--no-tests") {
        var testProcess = spawnProcess("test");
    }

    // We do not want to watch for changes in production
    if (isProduction) return;

    console.log("watching", process.cwd());
    var changedTimer;
    fs.watch(process.cwd(), {recursive: true}, function (event, filename) {
        clearTimeout(changedTimer);
        changedTimer = setTimeout(function () {
            console.log(chalk.yellow("[change detected] restarting server…", filename));
            server.kill();
            server = spawnProcess("server");
        }, 500);
    });
}

script();

