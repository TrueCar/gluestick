const commander = require('commander');
const process = require('process');
const { highlight } = require('./colorScheme');
const cliHelpers = require('./helpers');
const execWithConfig = require('./execWithConfig');
const commandApi = require('./commandApi');

const debugServerOption = ['-D, --debug-server', 'debug server side rendering with built-in node inspector'];
const debugServerPortOption = ['-p, --debug-port <n>', 'port on which to run node inspector'];
const skipBuildOption = ['-P, --skip-build', 'skip build when running in production mode'];
const statelessFunctionalOption = ['-F, --functional', '(generate component) stateless functional component'];
const logLevelOption = ['-L, --log-level <level>', 'set the logging level', /^(error|warn|success|info|debug)$/, null];
const entrypointsOption = ['-E, --entrypoints <entrypoints>', 'Enter specific entrypoint or a group'];

const safelyExecCommand = (commandFn) => (...commandArguments) => {
  try {
    commandFn(...commandArguments);
  } catch (error) {
    const logger = commandApi.getLogger();
    logger.fatal(error);
  }
};

commander
  .version(cliHelpers.getVersion());

commander
  .command('new')
  .description('generate a new application')
  .arguments('<appName>')
  .option('-d, --dev <path>', 'path to dev version of gluestick')
  .option('-s, --skip-main', 'gluestick will not generate main app')
  .action(safelyExecCommand((...commandArguments) => {
    require('../commands/new')(commandApi, commandArguments);
  }));

commander
  .command('generate <container|component|reducer|generator>')
  .description('generate a new entity from given template')
  .arguments('<name>')
  .option('-E --entry-point <entryPoint>', 'entry point for generated files')
  .option(...statelessFunctionalOption)
  .option('-O, --gen-options <value>', 'options to pass to the generator')
  .action(safelyExecCommand((...commandArguments) => {
    require('../commands/generate')(commandApi, commandArguments);
  }));

// commander
//   .command('destroy <container|component|reducer>')
//   .description('destroy a generated container')
//   .arguments('<name>')
//   .option('-E --entry-point <entryPoint>', 'entry point (app) from which entity should be removed')
//   .action((...commandArguments) => {
//     execWithConfig(
//       require('../commands/destroy'),
//       commandArguments,
//       { useGSConfig: true, skipProjectConfig: true, skipPlugins: true },
//     );
//   });

// commander
//   .command('auto-upgrade')
//   .description('perform automatic dependency and gluestick files upgrade')
//   .action((...commandArguments) => {
//     execWithConfig(
//       require('../commands/autoUpgrade'),
//       commandArguments,
//       {
//         useGSConfig: true,
//         useWebpackConfig: false,
//         skipPlugins: true,
//         skipClientEntryGeneration: true,
//         skipServerEntryGeneration: true,
//       },
//     );
//   });

// commander
//   .command('start')
//   .alias('s')
//   .description('start everything')
//   .option('-T, --run-tests', 'run test hook')
//   .option('--dev', 'disable gluestick verion check')
//   .option('-C --coverage', 'create test coverage')
//   .option(...entrypointsOption)
//   .option(...logLevelOption)
//   .option(...debugServerOption)
//   .option(...debugServerPortOption)
//   .option(...skipBuildOption)
//   .action((...commandArguments) => {
//     execWithConfig(
//       require('../commands/start'),
//       commandArguments,
//       {
//         useGSConfig: true,
//         useWebpackConfig: false,
//         skipPlugins: true,
//         skipClientEntryGeneration: true,
//         skipServerEntryGeneration: true,
//       },
//     );
//   });

commander
  .command('build')
  .description('create production asset build')
  .option('-S, --stats', 'create webpack stats file')
  .option('--client', 'gluestick builds only client bundle')
  .option('--server', 'gluestick builds only server bundle')
  .option('-Z, --static', 'prepare html file for static hosting')
  .action(safelyExecCommand((...commandArguments) => {
    require('../commands/build')(commandApi, commandArguments);
  }));

commander
  .command('bin')
  .allowUnknownOption(true)
  .description('access dependencies bin directory')
  .action(safelyExecCommand((...commandArguments) => {
    require('../commands/bin')(commandApi, commandArguments);
  }));

commander
  .command('dockerize')
  .description('create docker image')
  .arguments('<name>')
  .action(safelyExecCommand((...commandArguments) => {
    require('../commands/dockerize')(commandApi, commandArguments);
  }));

// commander
//   .command('start-client', null, { noHelp: true })
//   .description('start client')
//   .option(...logLevelOption)
//   .option(...entrypointsOption)
//   .action((...commandArguments) => {
//     process.env.COMMAND = 'start-client';
//     execWithConfig(
//       require('../commands/start-client'),
//       commandArguments,
//       { useGSConfig: true, useWebpackConfig: true, skipServerEntryGeneration: true },
//     );
//   });

// commander
//   .command('start-server', null, { noHelp: true })
//   .description('start server')
//   .option(...logLevelOption)
//   .option(...entrypointsOption)
//   .option(...debugServerOption)
//   .option(...debugServerPortOption)
//   .action((...commandArguments) => {
//     process.env.COMMAND = 'start-server';
//     execWithConfig(
//       require('../commands/start-server'),
//       commandArguments,
//       {
//         useGSConfig: true,
//         useWebpackConfig: true,
//         skipClientEntryGeneration: true,
//         // Performance tweak: if NODE_ENV is production start-server will only run server bundle
//         // without creating bundle
//         skipServerEntryGeneration: process.env.NODE_ENV === 'production',
//       });
//   });

commander
  .command('test')
  .allowUnknownOption()
  .option('-D, --debug-test', 'debug tests with built-in node inspector')
  .description('start tests')
  .action(safelyExecCommand((...commandArguments) => {
    require('../commands/test')(commandApi, commandArguments);
  }));

// This is a catch all command. DO NOT PLACE ANY COMMANDS BELOW THIS
commander
  .command('*', null, { noHelp: true })
  .action((cmd) => {
    const logger = commandApi.getLogger();
    logger.clear();
    logger.warn(`Command '${highlight(cmd)}' not recognized`);
    commander.help();
  });

commander.parse(process.argv);
