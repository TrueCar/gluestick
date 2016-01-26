const commander = require("commander");
const fs = require("fs");
const path = require("path");
const process = require("process");
const {exec, spawn} = require("child_process");
const newApp = require("./commands/new");
const startClient = require("./commands/start-client");
const startServer = require("./commands/start-server");
const startTest = require("./commands/test");
const generate = require("./commands/generate");
const destroy = require("./commands/destroy");
const chalk = require("chalk");
const autoUpgrade = require("./auto-upgrade");
const chokidar = require("chokidar");

const command = process.argv[2];
const isProduction = process.env.NODE_ENV === "production";

const IS_WINDOWS = process.platform === "win32";

commander
  .version(getVersion());

commander
  .command("new")
  .description("generate a new application")
  .arguments("<app_name>")
  .action(newApp);

commander
  .command("generate <container|component|reducer>")
  .description("generate a new container")
  .arguments("<name>")
  .action(generate);

commander
  .command("destroy <container|component|reducer>")
  .description("destroy a generated container")
  .arguments("<name>")
  .action(destroy);

commander
  .command("start")
  .description("start everything")
  .option("-T, --no_tests", "ignore test hook")
  .action((options) => startAll(options.no_tests));

commander
  .command("build")
  .description("create production asset build")
  .action(() => startClient(true));

commander
  .command("start-client", null, {noHelp: true})
  .description("start client")
  .action(() => startClient(false));

commander
  .command("start-server", null, {noHelp: true})
  .description("start server")
  .action(() => startServer());

const firefoxOption = {
  command: "-F, --firefox",
  description: "Use Firefox with test runner"
};

commander
  .command("start-test", null, {noHelp: true})
  .option(firefoxOption.command, firefoxOption.description)
  .description("start test")
  .action((options) => startTest(options));

commander
  .command("test")
  .option(firefoxOption.command, firefoxOption.description)
  .description("start tests")
  .action(() => spawnProcess("test", process.argv.slice(3)));

// This is a catch all command. DO NOT PLACE ANY COMMANDS BELOW THIS
commander
  .command('*', null, {noHelp: true})
  .action(function(cmd){
    console.log(`Error: Command '${cmd}' not recognized`);
    commander.help();
});

commander.parse(process.argv);

function getVersion () {
  var packageFileContents = fs.readFileSync(path.join(__dirname, "..", "package.json"));
  var packageObject = JSON.parse(packageFileContents);
  return packageObject.version;
}

function spawnProcess (type, args=[]) {
  var childProcess;
  var postFix = IS_WINDOWS ? ".cmd" : "";
  switch (type) {
    case "client":
      childProcess = spawn("gluestick" + postFix, ["start-client", ...args], {stdio: "inherit", env: Object.assign({}, process.env)});
      break;
    case "server":
      childProcess = spawn("gluestick" + postFix, ["start-server", ...args], {stdio: "inherit", env: Object.assign({}, process.env, {NODE_ENV: isProduction ? "production": "development-server"})});
      break;
    case "test":
      childProcess = spawn("gluestick" + postFix, ["start-test", ...args], {stdio: "inherit", env: Object.assign({}, process.env, {NODE_ENV: isProduction ? "production": "development-test"})});
      break;
  }

  childProcess.on("error", function (data) { console.log(chalk.red(JSON.stringify(arguments))) });
  return childProcess;
}

async function startAll(withoutTests=false) {
  await autoUpgrade();

  var client = spawnProcess("client");
  var server = spawnProcess("server");

  // Start tests unless they asked us not to or we are in production mode
  if (!isProduction && !withoutTests) {
    var testProcess = spawnProcess("test");
  }
}
