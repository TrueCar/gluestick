const commander = require("commander");
const process = require("process");
const { highlight } = require("./lib/cliColorScheme");
const cliHelpers = require("./cliHelpers");
const execWithConfig = require("./execWithConfig");

const debugServerOption = ["-D, --debug-server", "debug server side rendering with built-in node inspector"];
const debugServerPortOption = ["-p, --debug-port <n>", "port on which to run node inspector"];
const debugTestOption = ["-B, --debug-test", "debug tests with built-in node inspector"];
const karmaTestOption = ["-k, --karma", "run tests in Karma"];
const mochaReporterOption = ["-r, --reporter [type]", "run tests in Node.js"];
const firefoxOption = ["-F, --firefox", "Use Firefox with test runner"];
const singleRunOption = ["-S, --single", "Run test suite only once"];
const skipBuildOption = ["-P, --skip-build", "skip build when running in production mode"];
const statelessFunctionalOption = ["-F, --functional", "(generate component) stateless functional component"];

commander.version(cliHelpers.getVersion());

commander
  .command("new")
  .description("generate a new application")
  .arguments("<app_name>")
  .action((...commandArguments) => {
    execWithConfig(
      require("./commands/new"),
      commandArguments,
      { useGSConfig: true }
    );
  });

commander
  .command("generate <container|component|reducer|generator>")
  .description("generate a new entity from given template")
  .arguments("<name>")
  .option(...statelessFunctionalOption)
  .action((...commandArguments) => {
    execWithConfig(
      require("./commands/generate"),
      commandArguments
    );
  });

commander
  .command("destroy <container|component|reducer>")
  .description("destroy a generated container")
  .arguments("<name>")
  .action((...commandArguments) => {
    execWithConfig(
      require("./commands/destroy"),
      commandArguments
    );
  });

commander
  .command("start")
  .alias("s")
  .description("start everything")
  .option("-T, --run-tests", "run test hook")
  .option("-L, --log-level <level>", "set the logging level", /^(fatal|error|warn|info|debug|trace|silent)$/, null)
  .option("-E, --log-pretty [true|false]", "set pretty printing for logging", cliHelpers.parseBooleanFlag)
  .option(...debugServerOption)
  .option(...debugServerPortOption)
  .option(...debugTestOption)
  .option(...mochaReporterOption)
  .option(...karmaTestOption)
  .option(...skipBuildOption)
  .action((...commandArguments) => {
    execWithConfig(
      require("./commands/start"),
      commandArguments,
      { useGSConfig: true, useWebpackConfig: true },
      cliHelpers.notifyUpdate
    );
  });

commander
  .command("build")
  .description("create production asset build")
  .action((...commandArguments) => {
    execWithConfig(
      require("./commands/build"),
      commandArguments,
      { useGSConfig: true, useWebpackConfig: true }
    );
  });

commander
  .command("bin")
  .allowUnknownOption(true)
  .description("access dependencies bin directory")
  .action((...commandArguments) => {
    execWithConfig(
      require("./commands/bin"),
      commandArguments,
    );
  });

commander
  .command("dockerize")
  .description("create docker image")
  .arguments("<name>")
  .action((...commandArguments) => {
    execWithConfig(
      require("./commands/dockerize"),
      commandArguments
    );
  });

commander
  .command("start-client", null, {noHelp: true})
  .description("start client")
  .action((...commandArguments) => {
    execWithConfig(
      require("./commands/start-client"),
      commandArguments,
      { useGSConfig: true, useWebpackConfig: true}
    );
  });

commander
  .command("start-server", null, {noHelp: true})
  .description("start server")
  .option(...debugServerOption)
  .option(...debugServerPortOption)
  .option(...debugTestOption)
  .option(...mochaReporterOption)
  .action((...commandArguments) => {
    execWithConfig(
      require("./commands/start-server"),
      {
        debugServer: commandArguments[0].debugServer,
        debugPort: commandArguments[0].debugPort
      },
      { useGSConfig: true, useWebpackConfig: true });
  });

commander
  .command("test")
  .option(...firefoxOption)
  .option(...singleRunOption)
  .option(...karmaTestOption)
  .option(...debugTestOption)
  .option(...mochaReporterOption)
  .description("start tests")
  .action(() => {
    execWithConfig(
      require("./commands/test"),
      commander.rawArgs.slice(3),
      { useGSConfig: true, useWebpackConfig: true }
    );
  });

/*commander
  .command("run")
  .arguments("<script_path>")
  .action((scriptPath) => run(scriptPath, (err) => {
    if (err) { logger.error(err); }
  }));*/

// This is a catch all command. DO NOT PLACE ANY COMMANDS BELOW THIS
commander
  .command("*", null, {noHelp: true})
  .action(function(cmd){
    process.stdout.error(`Command '${highlight(cmd)}' not recognized`);
    commander.help();
  });

commander.parse(process.argv);
