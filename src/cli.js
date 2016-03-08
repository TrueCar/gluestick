const commander = require("commander");
var fs = require("fs");
const path = require("path");
const process = require("process");
const {exec, spawn} = require("cross-spawn");
const lazyMethodRequire = require("./lib/LazyMethodRequire").default(__dirname);

const newApp = lazyMethodRequire("./commands/new");
const startClient = lazyMethodRequire("./commands/start-client");
const startServer = lazyMethodRequire("./commands/start-server");
const startTest = lazyMethodRequire("./commands/test");
const generate = lazyMethodRequire("./commands/generate");
const destroy = lazyMethodRequire("./commands/destroy");
const dockerize = lazyMethodRequire("./commands/dockerize");

const updateLastVersionUsed = require("./lib/updateVersion.js");
const getVersion = require("./lib/getVersion");
const logger = require("./lib/logger");
const logsColorScheme = require("./lib/logsColorScheme");
const { highlight } = logsColorScheme;

const autoUpgrade = require("./auto-upgrade");
const chokidar = require("chokidar");

const command = process.argv[2];
const isProduction = process.env.NODE_ENV === "production";

const IS_WINDOWS = process.platform === "win32";

commander
  .version(getVersion());

commander
  .command("touch")
  .description("update project version")
  .action((options)=> updateLastVersionUsed())

commander
  .command("new")
  .description("generate a new application")
  .arguments("<app_name>")
  .action(newApp)
  .action((options)=> updateLastVersionUsed());

commander
  .command("generate <container|component|reducer>")
  .description("generate a new container")
  .arguments("<name>")
  .action((type, name) => generate(type, name, (err) => {
    if (err) console.log(chalk.red(`ERROR: ${err}`)); 
  }))
  .action((options)=> updateLastVersionUsed())

commander
  .command("destroy <container|component|reducer>")
  .description("destroy a generated container")
  .arguments("<name>")
  .action(destroy) 
  .action((options)=> updateLastVersionUsed());

const debugOption = {
  command: "-D, --debug",
  description: "debug server side rendering with node-inspector"
};

commander
  .command("start")
  .description("start everything")
  .option("-T, --no_tests", "ignore test hook")
  .option(debugOption.command, debugOption.description)
  .action((options) => startAll(options.no_tests, options.debug))
  .action((options)=> updateLastVersionUsed());

commander
  .command("build")
  .description("create production asset build")
  .action(() => startClient(true))
  .action((options)=> updateLastVersionUsed());

commander
  .command("dockerize")
  .description("create docker image")
  .arguments("<name>")
  .action(upgradeAndDockerize)
  .action((options)=> updateLastVersionUsed());

commander
  .command("start-client", null, {noHelp: true})
  .description("start client")
  .action(() => startClient(false))
  .action((options)=> updateLastVersionUsed());


commander
  .command("start-server", null, {noHelp: true})
  .description("start server")
  .option(debugOption.command, debugOption.description)
  .action((options) => startServer(options.debug))
  .action((options)=> updateLastVersionUsed());

const firefoxOption = {
  command: "-F, --firefox",
  description: "Use Firefox with test runner"
};

commander
  .command("start-test", null, {noHelp: true})
  .option(firefoxOption.command, firefoxOption.description)
  .description("start test")
  .action((options) => startTest(options))
  .action((options)=> updateLastVersionUsed());

commander
  .command("test")
  .option(firefoxOption.command, firefoxOption.description)
  .description("start tests")
  .action(() => spawnProcess("test", process.argv.slice(3)))
  .action((options)=> updateLastVersionUsed());

// This is a catch all command. DO NOT PLACE ANY COMMANDS BELOW THIS
commander
  .command('*', null, {noHelp: true})
  .action(function(cmd){
    console.log(`Error: Command '${cmd}' not recognized`);
    commander.help();
});

commander.parse(process.argv);

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

async function startAll(withoutTests=false, debug=false) {
  try {
    await autoUpgrade();
  }
  catch (e) {
    console.log(chalk.red("ERROR during auto upgrade"), e);
    process.exit();
  }

  var client = spawnProcess("client");
  var server = spawnProcess("server", (debug ? ["--debug"] : []));

  // Start tests unless they asked us not to or we are in production mode
  if (!isProduction && !withoutTests) {
    var testProcess = spawnProcess("test");
  }
}

async function upgradeAndDockerize (name) {
  await autoUpgrade();
  dockerize(name);
}
