const path = require('path');
const commander = require('commander');
const mkdir = require('mkdirp');
const spawn = require('cross-spawn');
const chalk = require('chalk');
const fs = require('fs');

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
    let pathToGluestick = null;
    let gluestickPackage = {};
    try {
      pathToGluestick = path.join(process.cwd(), appName, options.dev ? options.dev : '/');
      gluestickPackage = require(path.join(pathToGluestick, 'package.json'));
    } catch (error) {
      exitWithError(
        `Development GlueStick path ${pathToGluestick} is not valid`,
      );
    }
    if (gluestickPackage.name !== 'gluestick') {
      exitWithError(
        `${pathToGluestick} is not a path to GlueStick`,
      );
    }
    const pathToApp = path.join(process.cwd(), appName);
    if (fs.existsSync(pathToApp)) {
      exitWithError(
        `Directory ${pathToApp} already exists`,
      );
    }
    mkdir.sync(path.join(process.cwd(), appName));
    const cmd = options.yarn ? 'yarn' : 'npm';
    const args = options.yarn ? ['add'] : ['install'];
    args[args.length] = options.dev ? [options.dev] : ['gluestick'];
    if (options.yarn && options.dev) {
      args[args.length - 1] = `file:${args[args.length - 1]}`;
    }
    spawn.sync(
      cmd,
      args,
      {
        cwd: path.join(process.cwd(), appName),
        stdio: 'inherit',
      },
    );
    spawn.sync(
      './node_modules/.bin/gluestick',
      commander.rawArgs.slice(2),
      {
        cwd: path.join(process.cwd(), appName),
        stdio: 'inherit',
      },
    );
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
      srcPath = path.join(
        process.cwd(),
        packageContent.dependencies.gluestick.replace('file:', ''),
      );
    } catch (error) {
      exitWithError('Invalid package.json');
    }
    const wmlBin = path.join(__dirname, './node_modules/.bin/wml');
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
