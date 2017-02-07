const commander = require("commander");
const process = require("process");
const { spawn } = require("cross-spawn");
const fs = require("fs-extra");
const path = require("path");
const lazyMethodRequire = require("./lib/LazyMethodRequire").default(__dirname);

const bin = lazyMethodRequire("./commands/bin");
const build = lazyMethodRequire("./commands/build");
const newApp = lazyMethodRequire("./commands/new");
const startClient = lazyMethodRequire("./commands/start-client");
const startServer = lazyMethodRequire("./commands/start-server");
const startTest = lazyMethodRequire("./commands/test");
const generate = lazyMethodRequire("./commands/generate");
const destroy = lazyMethodRequire("./commands/destroy");
const dockerize = lazyMethodRequire("./commands/dockerize");
const run = lazyMethodRequire("./commands/run");

const updateLastVersionUsed = require("./lib/updateVersion");
const getVersion = require("./lib/getVersion");
const updateWebpackAssetPath = require("./lib/updateWebpackAssetPath");

const logger = require("./lib/cliLogger");
const cliColorScheme = require("./lib/cliColorScheme");
const { highlight } = cliColorScheme;

const utils = require("./lib/utils");
const { quitUnlessGluestickProject } = utils;

const autoUpgrade = require("./autoUpgrade");

const isProduction = process.env.NODE_ENV === "production";

const IS_WINDOWS = process.platform === "win32";

const currentGluestickVersion = getVersion();

const debugServerOption = ["-D, --debug-server", "debug server side rendering with built-in node inspector"];
const debugServerPortOption = ["-p, --debug-port <n>", "port on which to run node inspector"];
const firefoxOption = ["-F, --firefox", "Use Firefox with test runner"];
const singleRunOption = ["-S, --single", "Run test suite only once"];
const skipBuildOption = ["-P, --skip-build", "skip build when running in production mode"];
const statelessFunctionalOption = ["-F, --functional", "(generate component) stateless functional component"];
const prepareStaticOption = ["-Z, --static", "prepare html file for static hosting in the build"];
const entrypointsOption = ["-E, --entrypoints <entrypoints>", "Enter specific entrypoint or a group"];

const testDebugOption = ["-D, --debug-test", "debug tests with built-in node inspector"];
const testReportCoverageOption = ["-C --coverage", "Create test coverage"];
const testWatchOption = ["-W --watch", "Watch tests"];
const testPatternOption = ["-R --pattern [pattern]", "Run specific test regex pattern name"];

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
  .command("generate <container|component|reducer|generator>")
  .description("generate a new entity from given template")
  .arguments("<name>")
  .option(...statelessFunctionalOption)
  .option("-O, --gen-options <value>", "options to pass to the generator")
  .action(checkGluestickProject)
  .action(generate)
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
  .alias("s")
  .description("start everything")
  .option("-T, --run-tests", "run test hook")
  .option("-L, --log-level <level>", "set the logging level", /^(fatal|error|warn|info|debug|trace|silent)$/, null)
  .option("-Z, --log-pretty [true|false]", "set pretty printing for logging", parseFlag)
  .option(...entrypointsOption)
  .option(...debugServerOption)
  .option(...debugServerPortOption)
  .option(...testReportCoverageOption)
  .option(...skipBuildOption)
  .action(checkGluestickProject)
  .action(() => updateLastVersionUsed(currentGluestickVersion))
  .action(() => notifyUpdates())
  .action(startAll);

commander
  .command("build")
  .description("create production asset build")
  .option(...prepareStaticOption)
  .action(checkGluestickProject)
  .action((options) => build(options.static))
  .action(() => updateLastVersionUsed(currentGluestickVersion));

commander
  .command("bin")
  .allowUnknownOption(true)
  .description("access dependencies bin directory")
  .action(bin);

commander
  .command("dockerize")
  .description("create docker image")
  .arguments("<name>")
  .action(checkGluestickProject)
  .action(() => updateLastVersionUsed(currentGluestickVersion))
  .action(upgradeAndDockerize);

commander
  .command("start-client", null, {noHelp: true})
  .description("start client")
  .option(...entrypointsOption)
  .action(checkGluestickProject)
  .action(startClient)
  .action(() => updateLastVersionUsed(currentGluestickVersion));

commander
  .command("start-server", null, {noHelp: true})
  .description("start server")
  .option(...debugServerOption)
  .option(...debugServerPortOption)
  .action(checkGluestickProject)
  .action((options) => {
    startServer(options.debugServer, options.debugPort);
  })
  .action(() => updateLastVersionUsed(currentGluestickVersion));

commander
  .command("start-test", null, {noHelp: true})
  .option(...firefoxOption)
  .option(...singleRunOption)
  .option(...testDebugOption)
  .option(...testReportCoverageOption)
  .option(...testWatchOption)
  .option(...testPatternOption)
  .description("start test")
  .action(checkGluestickProject)
  .action(startTest)
  .action(() => updateLastVersionUsed(currentGluestickVersion));

commander
  .command("test")
  .option(...firefoxOption)
  .option(...singleRunOption)
  .option(...testDebugOption)
  .option(...testReportCoverageOption)
  .option(...testWatchOption)
  .option(...testPatternOption)
  .description("start tests")
  .action(checkGluestickProject)
  .action(() => updateLastVersionUsed(currentGluestickVersion))
  .action(() => {
    const proc = spawnProcess("test", commander.rawArgs.slice(3));
    proc.on("close", code => { process.exit(code); });
  });

commander
  .command("run")
  .arguments("<script_path>")
  .action(() => updateLastVersionUsed(currentGluestickVersion))
  .action((scriptPath) => run(scriptPath, (err) => {
    if (err) { logger.error(err); }
  }));

// This is a catch all command. DO NOT PLACE ANY COMMANDS BELOW THIS
commander
  .command("*", null, {noHelp: true})
  .action(function(cmd){
    logger.error(`Command '${highlight(cmd)}' not recognized`);
    commander.help();
  });

commander.parse(process.argv);

function parseFlag (val) {
  if (["false", "0", "no"].includes(val)) {
    return false;
  }
  return true;
}

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
    await autoUpgrade(options.logLevel);
  }
  catch (e) {
    logger.error(`During auto upgrade: ${e}`);
    logger.debug(e.stack);
    process.exit();
  }

  // Update the ASSET_PATH in webpack-assets.json in production environments
  if (isProduction) {
    updateWebpackAssetPath();
  }

  // Set parsed command line args so that spawned processes can refer to them
  const parsedOptions = getCommandOptions(options);
  process.env.GS_COMMAND_OPTIONS = JSON.stringify(parsedOptions);

  // in production spawning the client really just creates a build. Our docker
  // images pre-build and therefor they start with the skip build option as
  // true.  We only want to start the client in development mode or if
  // skipBuild is not specified
  if (!(isProduction && options.skipBuild)) {
    spawnProcess("client", commander.rawArgs.slice(3).filter(arg => !arg.includes("server")));
  }

  // Remove -E, --entrypoints argument and it's value from server arguments
  const args = commander.rawArgs.slice(3);
  let valueIndex = args.length;
  const srvArgs = args.filter((arg, index) => {
    if (arg === "-E" || arg === "--entrypoints") {
      valueIndex = index;
      return false;
    }
    return true;
  });
  if (valueIndex < srvArgs.length) {
    srvArgs.splice(valueIndex, 1);
  }
  spawnProcess("server", srvArgs);

  // Start tests only they asked us to or we are in production mode
  if (!isProduction && options.runTests) {
    spawnProcess("test", commander.rawArgs.slice(4));
  }
}

async function upgradeAndDockerize (name) {
  await autoUpgrade();
  dockerize(name);
}

function getCommandOptions(options) {
  const parsedOptionEntries = Object.entries(options).filter(entry => !(entry[0].match(/^_.+/)));
  const parsedOptions = parsedOptionEntries.reduce((obj, [key, value]) => {
    // remove keys that are internal to commander
    if (["parent", "options", "commands"].includes(key)) {
      return obj;
    }
    return {...obj, [key]: value};
  }, {});
  return parsedOptions;
}
