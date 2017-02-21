const commander = require('commander');
const process = require('process');
const { highlight } = require('./colorScheme');
const cliHelpers = require('./helpers');
const execWithConfig = require('./execWithConfig');

const debugServerOption = ['-D, --debug-server', 'debug server side rendering with built-in node inspector'];
const debugServerPortOption = ['-p, --debug-port <n>', 'port on which to run node inspector'];
const firefoxOption = ['-F, --firefox', 'Use Firefox with test runner'];
const singleRunOption = ['-S, --single', 'Run test suite only once'];
const skipBuildOption = ['-P, --skip-build', 'skip build when running in production mode'];
const statelessFunctionalOption = ['-F, --functional', '(generate component) stateless functional component'];

const testDebugOption = ['-D, --debug-test', 'debug tests with built-in node inspector'];
const testReportCoverageOption = ['-C --coverage', 'Create test coverage'];
const testWatchOption = ['-W --watch', 'Watch tests'];
const testPatternOption = ['-R --pattern [pattern]', 'Run specific test regex pattern name'];

commander
  .version(cliHelpers.getVersion());

commander
  .command('new')
  .description('generate a new application')
  .arguments('<appName>')
  .option('-d, --dev <path>', 'path to dev version of gluestick')
  .action((...commandArguments) => {
    execWithConfig(
      require('../commands/new'),
      commandArguments,
      { useGSConfig: true, skipProjectConfig: true },
    );
  });

commander
  .command('generate <container|component|reducer|generator>')
  .description('generate a new entity from given template')
  .arguments('<name>')
  .option('-E --entry-point <entryPoint>', 'entry point for generated files')
  .option(...statelessFunctionalOption)
  .option('-O, --gen-options <value>', 'options to pass to the generator')
  .action((...commandArguments) => {
    execWithConfig(
      require('../commands/generate'),
      commandArguments,
    );
  });

commander
  .command('destroy <container|component|reducer>')
  .description('destroy a generated container')
  .arguments('<name>')
  .option('-E --entry-point <entryPoint>', 'entry point for generated files')
  .action((...commandArguments) => {
    execWithConfig(
      require('../commands/destroy'),
      commandArguments,
    );
  });

commander
  .command('start')
  .alias('s')
  .description('start everything')
  .option('-T, --run-tests', 'run test hook')
  .option('-L, --log-level <level>', 'set the logging level', /^(fatal|error|warn|info|debug|trace|silent)$/, null)
  .option('-E, --log-pretty [true|false]', 'set pretty printing for logging', cliHelpers.parseBooleanFlag)
  .option(...debugServerOption)
  .option(...debugServerPortOption)
  .option(...testReportCoverageOption)
  .option(...skipBuildOption)
  .action((...commandArguments) => {
    execWithConfig(
      require('../commands/start'),
      commandArguments,
      { useGSConfig: false, useWebpackConfig: false },
    );
  });

commander
  .command('build')
  .description('create production asset build')
  .action((...commandArguments) => {
    execWithConfig(
      require('../commands/build'),
      commandArguments,
      { useGSConfig: true, useWebpackConfig: true },
    );
  });

commander
  .command('bin')
  .allowUnknownOption(true)
  .description('access dependencies bin directory')
  .action((...commandArguments) => {
    execWithConfig(
      require('../commands/bin'),
      commandArguments,
    );
  });

commander
  .command('dockerize')
  .description('create docker image')
  .arguments('<name>')
  .action((...commandArguments) => {
    execWithConfig(
      require('../commands/dockerize'),
      commandArguments,
    );
  });

commander
  .command('start-client', null, { noHelp: true })
  .description('start client')
  .action((...commandArguments) => {
    execWithConfig(
      require('../commands/start-client'),
      commandArguments,
      { useGSConfig: true, useWebpackConfig: true, skipServerEntryGeneration: true },
    );
  });

commander
  .command('start-server', null, { noHelp: true })
  .description('start server')
  .option(...debugServerOption)
  .option(...debugServerPortOption)
  .action((...commandArguments) => {
    execWithConfig(
      require('../commands/start-server'),
      commandArguments,
      { useGSConfig: true, useWebpackConfig: true, skipClientEntryGeneration: true });
  });

commander
  .command('test')
  .option(...firefoxOption)
  .option(...singleRunOption)
  .option(...testDebugOption)
  .option(...testReportCoverageOption)
  .option(...testWatchOption)
  .option(...testPatternOption)
  .description('start tests')
  .action((...commandArguments) => {
    execWithConfig(
      require('../commands/test'),
      commandArguments,
      {
        useGSConfig: true,
        useWebpackConfig: true,
        skipClientEntryGeneration: true,
        skipServerEntryGeneration: true,
      },
    );
  });

// This is a catch all command. DO NOT PLACE ANY COMMANDS BELOW THIS
commander
  .command('*', null, { noHelp: true })
  .action((cmd) => {
    process.stderr.write(`Command '${highlight(cmd)}' not recognized`);
    commander.help();
  });

commander.parse(process.argv);
