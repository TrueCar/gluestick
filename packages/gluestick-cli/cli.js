const path = require('path');
const commander = require('commander');
const spawn = require('cross-spawn');
const chalk = require('chalk');
const newCmd = require('./new');
const watchCmd = require('./watch');

const exitWithError = message => {
  console.error(chalk.red(`ERROR: ${message}`));
  process.exit(1);
};

commander.version(
  require(path.join(__dirname, 'package.json')).version,
);

commander
  .command('new')
  .description('generate a new application')
  .arguments('<appName>')
  .option('-d, --dev <path>', 'relative path to development version of gluestick')
  .option('-y, --yarn', 'use yarn instead of npm')
  .action((appName, options) => {
    newCmd(appName, options, exitWithError);
  });

commander
  .command('reinstall-dev')
  .description('reinstall gluestick dependency')
  .action(() => {
    let gsPath = null;
    try {
      gsPath = require(path.join(process.cwd(), 'package.json')).dependencies.gluestick;
    } catch (error) {
      exitWithError(error.message);
    }
    spawn(
      'npm',
      ['install', gsPath],
      { stdio: 'inherit' },
    );
  });

commander
  .command('watch')
  .description('watch and apply changes from gluestick to project')
  .action(() => {
    watchCmd(exitWithError);
  });

commander
  .command('*', null, { noHelp: true })
  .action(() => {
    spawn(
      './node_modules/.bin/gluestick',
      commander.rawArgs.slice(2),
      { stdio: 'inherit' },
    );
  });

commander.parse(process.argv);
