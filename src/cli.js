const commander = require("commander");
const process = require("process");
const { spawn } = require("cross-spawn");
const fs = require("fs-extra");
const path = require("path");
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

const autoUpgrade = require("./autoUpgrade");

const isProduction = process.env.NODE_ENV === "production";

const IS_WINDOWS = process.platform === "win32";

const currentGluestickVersion = getVersion();

const debugServerOption = ["-D, --debug-server", "debug server side rendering with node-inspector"];
const debugTestOption = ["-B, --debug-test", "debug tests with node-inspector"];
const karmaTestOption = ["-k, --karma", "run tests in Karma"];
const mochaReporterOption = ["-r, --reporter [type]", "run tests in Node.js"];
const firefoxOption = ["-F, --firefox", "Use Firefox with test runner"];
const singleRunOption = ["-S, --single", "Run test suite only once"];

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

commander
  .command("start")
  .description("start everything")
  .option("-T, --skip-tests", "ignore test hook")
  .option(...debugServerOption)
  .option(...debugTestOption)
  .option(...mochaReporterOption)
  .option(...karmaTestOption)
  .action(checkGluestickProject)
  .action(() => notifyUpdates())
  .action(startAll)
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
  .option(...debugServerOption)
  .option(...debugTestOption)
  .option(...mochaReporterOption)
  .action(checkGluestickProject)
  .action((options) => startServer(options.debugServer))
  .action(() => updateLastVersionUsed(currentGluestickVersion));

commander
  .command("start-test", null, {noHelp: true})
  .option(...firefoxOption)
  .option(...singleRunOption)
  .option(...karmaTestOption)
  .option(...debugTestOption)
  .option(...mochaReporterOption)
  .description("start test")
  .action(checkGluestickProject)
  .action(startTest)
  .action(() => updateLastVersionUsed(currentGluestickVersion));

commander
  .command("test")
  .option(...firefoxOption)
  .option(...singleRunOption)
  .option(...karmaTestOption)
  .option(...debugTestOption)
  .option(...mochaReporterOption)
  .description("start tests")
  .action(checkGluestickProject)
  .action(() => updateLastVersionUsed(currentGluestickVersion))
  .action(() => {
    const proc = spawnProcess("test", commander.rawArgs.slice(3));
    proc.on("close", code => { process.exit(code); });
  });

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

function notifyUpdates () {
  const indexFilePath = path.join(process.cwd(), "Index.js");
  const data = fs.readFileSync(indexFilePath);
  if (data.indexOf("Helmet.rewind()") === -1) {
    logger.info(`
##########################################################################
Upgrade Notice: Newer versions of Index.js now include react-helmet
for allowing dynamic changes to document header data. You will need to 
manually update your Index.js file to receive this change.
For a simple example see:
https://github.com/TrueCar/gluestick/blob/develop/templates/new/Index.js
##########################################################################
    `);
  }
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
    default:
      break;
  }
  childProcess.on("error", function () { logger.error(JSON.stringify(arguments)); });
  return childProcess;
}

/*
 * Start server and (optionally) tests in different processes.
 *
 * @param {object} options        Command-line options object directly from Commander
 */
async function startAll(options) {
  try {
    await autoUpgrade();
  }
  catch (e) {
    logger.error(`During auto upgrade: ${e}`);
    process.exit();
  }

  spawnProcess("client");
  spawnProcess("server", (options.debugServer ? ["--debug-server"] : []));

  // Start tests unless they asked us not to or we are in production mode
  if (!isProduction && !options.skipTests) {
    spawnProcess("test", commander.rawArgs.slice(3));
  }
}

async function upgradeAndDockerize (name) {
  await autoUpgrade();
  dockerize(name);
}

