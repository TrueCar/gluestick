const commander = require("commander");
const process = require("process");
const { spawn } = require("cross-spawn");
const lazyMethodRequire = require("./lib/LazyMethodRequire").default(__dirname);

const newApp = lazyMethodRequire("./commands/new");
const startClient = lazyMethodRequire("./commands/start-client");
const startServer = lazyMethodRequire("./commands/start-server");
const startTest = lazyMethodRequire("./commands/test");
const generate = lazyMethodRequire("./commands/generate");
const destroy = lazyMethodRequire("./commands/destroy");
const dockerize = lazyMethodRequire("./commands/dockerize");

const updateLastVersionUsed = require("./lib/updateVersion");
const getVersion = require("./lib/getVersion");
const logger = require("./lib/logger");
const logsColorScheme = require("./lib/logsColorScheme");
const { highlight } = logsColorScheme;

const utils = require("./lib/utils");
const { quitUnlessGluestickProject } = utils;

const autoUpgrade = require("./auto-upgrade");

const isProduction = process.env.NODE_ENV === "production";

const IS_WINDOWS = process.platform === "win32";

const currentGluestickVersion = getVersion();

commander
  .version(currentGluestickVersion);

commander
  .command("touch")
  .description("update project version")
  .action(checkGluestickProject)
  .action(() => updateLastVersionUsed(currentGluestickVersion));

commander
  .command("new")
  .description("generate a new application")
  .arguments("<app_name>")
  .action((app_name) => {
    if(newApp(app_name)) {
      updateLastVersionUsed(currentGluestickVersion, false);
    }
  });

commander
  .command("generate <container|component|reducer>")
  .description("generate a new container")
  .arguments("<name>")
  .action(checkGluestickProject)
  .action((type, name) => generate(type, name, (err) => {
    if (err) { logger.error(err); }
  }))
  .action(() => updateLastVersionUsed(currentGluestickVersion));

commander
  .command("destroy <container|component|reducer>")
  .description("destroy a generated container")
  .arguments("<name>")
  .action(checkGluestickProject)
  .action(destroy)
  .action(() => updateLastVersionUsed(currentGluestickVersion));

const debugOption = {
  command: "-D, --debug",
  description: "debug server side rendering with node-inspector"
};

commander
  .command("start")
  .description("start everything")
  .option("-T, --no_tests", "ignore test hook")
  .option(debugOption.command, debugOption.description)
  .action(checkGluestickProject)
  .action((options) => startAll(options.no_tests, options.debug))
  .action(() => updateLastVersionUsed(currentGluestickVersion));

commander
  .command("build")
  .description("create production asset build")
  .action(checkGluestickProject)
  .action(() => startClient(true))
  .action(() => updateLastVersionUsed(currentGluestickVersion));

commander
  .command("dockerize")
  .description("create docker image")
  .arguments("<name>")
  .action(checkGluestickProject)
  .action(upgradeAndDockerize)
  .action(() => updateLastVersionUsed(currentGluestickVersion));

commander
  .command("start-client", null, {noHelp: true})
  .description("start client")
  .action(checkGluestickProject)
  .action(() => startClient(false))
  .action(() => updateLastVersionUsed(currentGluestickVersion));

commander
  .command("start-server", null, {noHelp: true})
  .description("start server")
  .option(debugOption.command, debugOption.description)
  .action(checkGluestickProject)
  .action((options) => startServer(options.debug))
  .action(() => updateLastVersionUsed(currentGluestickVersion));

const firefoxOption = {
  command: "-F, --firefox",
  description: "Use Firefox with test runner"
};

const singleRunOption = {
  command: "-S, --single",
  description: "Run test suite only once"
};

commander
  .command("start-test", null, {noHelp: true})
  .option(firefoxOption.command, firefoxOption.description)
  .option(singleRunOption.command, singleRunOption.description)
  .description("start test")
  .action(checkGluestickProject)
  .action((options) => startTest(options))
  .action(() => updateLastVersionUsed(currentGluestickVersion));

commander
  .command("test")
  .option(firefoxOption.command, firefoxOption.description)
  .option(singleRunOption.command, singleRunOption.description)
  .description("start tests")
  .action(checkGluestickProject)
  .action(() => spawnProcess("test", process.argv.slice(3)))
  .action(() => updateLastVersionUsed(currentGluestickVersion));

// This is a catch all command. DO NOT PLACE ANY COMMANDS BELOW THIS
commander
  .command("*", null, {noHelp: true})
  .action(function(cmd){
    logger.error(`Command '${highlight(cmd)}' not recognized`);
    commander.help();
  });

commander.parse(process.argv);

function checkGluestickProject () {
  quitUnlessGluestickProject(commander.rawArgs[2]);
}

function spawnProcess (type, args=[]) {
  let childProcess;
  const postFix = IS_WINDOWS ? ".cmd" : "";
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
  childProcess.on("error", function (data) { logger.error(JSON.stringify(arguments)); });
  return childProcess;
}

async function startAll(withoutTests=false, debug=false) {
  try {
    await autoUpgrade();
  }
  catch (e) {
    logger.error(`During auto upgrade: ${e}`);
    process.exit();
  }

  const client = spawnProcess("client");
  const server = spawnProcess("server", (debug ? ["--debug"] : []));

  // Start tests unless they asked us not to or we are in production mode
  if (!isProduction && !withoutTests) {
    const testProcess = spawnProcess("test");
  }
}

async function upgradeAndDockerize (name) {
  await autoUpgrade();
  dockerize(name);
}

