const path = require('path');
const commander = require('commander');
const spawn = require('cross-spawn');
const chalk = require('chalk');

const newApp = require('./new');
const reinstallDev = require('./reinstallDev');
const watch = require('./watch');
const resetHard = require('./reset');

const version = require(path.join(__dirname, '../package.json')).version;

const exitWithError = message => {
  console.error(chalk.red(`ERROR: ${message}`));
  process.exit(1);
};

commander.version(version);

if (['-v', '-V', '--version'].indexOf(process.argv[2]) >= 0) {
  console.log(`${chalk.green('gluestick-cli')}: ${version} (global binary)`);
  let localVersion = 'n/a';
  let localInstalledVersion = '';
  try {
    localVersion = require(path.join(process.cwd(), 'package.json')).dependencies.gluestick;
  } catch (e) {
    // noop
  }
  try {
    localInstalledVersion = require(
      path.join(process.cwd(), 'node_modules/gluestick', 'package.json'),
    ).version;
  } catch (e) {
    // noop
  }
  console.log(
    `${chalk.green('gluestick')}: ${localVersion}${
      localVersion !== localInstalledVersion && localInstalledVersion.length
        ? `, installed ${localInstalledVersion}`
        : ''
    } (${
      localVersion !== 'n/a'
        ? 'local dependency in current directory'
        : 'not in gluestick project'
    })`,
  );
  process.exit(0);
}

commander
  .command('new')
  .description('generate a new application')
  .arguments('<appName>')
  .option('-p, --preset <preset>', 'specify preset to create project from')
  .option('-d, --dev <path>', 'relative path to development version of gluestick')
  .option('-s, --skip-main', 'gluestick will not generate main app')
  .option('-n, --npm', 'use npm instead of yarn')
  .action((appName, options) => {
    newApp(appName, options, exitWithError);
  });

commander
  .command('reinstall-dev')
  .description('reinstall gluestick dependency')
  .action(() => {
    reinstallDev(exitWithError);
  });

commander
  .command('watch')
  .description('watch and apply changes from gluestick to project')
  .action(() => {
    watch(exitWithError);
  });

commander
  .command('reset-hard')
  .description('remove gluestick and build, cache clean and reinstall-dev')
  .action(() => {
    resetHard();
  });

commander
  .command('*', null, { noHelp: true })
  .action(() => {
    const childProcess = spawn(
      './node_modules/.bin/gluestick',
      commander.rawArgs.slice(2),
      { stdio: 'inherit' },
    );
    childProcess.on('error', (error) => {
      console.error(chalk.red(error));
      process.exit(1);
    });
    childProcess.on('exit', (code) => {
      if (code !== 0) {
        process.exit(code);
      }
    });
  });

commander.parse(process.argv);
