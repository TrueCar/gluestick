const path = require('path');
const commander = require('commander');
const spawn = require('cross-spawn');
const chalk = require('chalk');
const newCmd = require('./new');

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
    const packagePath = path.join(process.cwd(), 'package.json');
    let packageContent = null;
    try {
      packageContent = require(packagePath);
    } catch (error) {
      exitWithError(`Cannot find package.json in ${packagePath}`);
    }
    let srcPath = null;
    try {
      if (!/file:.*/.test(packageContent.dependencies.gluestick)) {
        exitWithError('Gluestick dependency does not contain valid path');
      }
      const pathFromDependency = packageContent.dependencies.gluestick.replace('file://', '').replace('file:', '')
      srcPath = pathFromDependency[0] !== '/'
        ? path.join(
            process.cwd(),
            pathFromDependency
          )
        : pathFromDependency
    } catch (error) {
      exitWithError('Invalid package.json');
    }
    const wmlBin = path.join(__dirname, './node_modules/.bin/wml');
    spawn.sync(
      wmlBin,
      ['rm', 'all'],
      { stdio: 'inherit' },
    );
    spawn.sync(
      wmlBin,
      ['add', srcPath, path.join(process.cwd(), 'node_modules/gluestick')],
      { stdio: 'inherit' },
    );
    spawn.sync(
      'watchman',
      ['watch', srcPath],
      { stdio: 'inherit' },
    );
    spawn.sync(
      wmlBin,
      ['start'],
      { stdio: 'inherit' },
    );
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
