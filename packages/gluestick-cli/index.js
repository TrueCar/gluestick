#!/usr/bin/env node

const path = require('path');
const commander = require('commander');
const mkdir = require('mkdirp');
const spawn = require('cross-spawn');

commander.version(
  require(path.join(__dirname, 'package.json')).version
);

commander
  .command('new')
  .description('generate a new application')
  .arguments('<appName>')
  .option('-d, --dev <path>', 'development')
  .action((appName, options) => {
    mkdir.sync(path.join(process.cwd(), appName));
    spawn.sync(
      'npm',
      ['install', options.dev ? options.dev : 'gluestick'],
      {
        cwd: path.join(process.cwd(), appName),
        stdio: 'inherit'
      }
    );
    spawn.sync(
      './node_modules/.bin/gluestick',
      commander.rawArgs.slice(2),
      {
        cwd: path.join(process.cwd(), appName),
        stdio: 'inherit'
      }
    );
  });

commander
  .command('reinstall-dev')
  .description('reinstall gluestick dependency')
  .action(() => {
    const gsPath = require(path.join(process.cwd(), 'package.json')).dependencies.gluestick;
    spawn(
      'npm',
      ['install', gsPath],
      { stdio: 'inherit' }
    );
  });

commander
  .command('watch')
  .description('applying changes in gluestick folder')
  .action(() => {
    let srcPath = require(path.join(process.cwd(), 'package.json')).dependencies.gluestick;
    srcPath = srcPath.replace('file:', '');
    srcPath = path.join(process.cwd(), srcPath);
    const wmlBin = path.join(__dirname, './node_modules/.bin/wml');
    spawn.sync(
      wmlBin,
      ['add', srcPath, path.join(process.cwd(), 'node_modules/gluestick'), '-y'],
      { stdio: 'inherit' }
    );
    console.log(1);
    spawn.sync(
      'watchman',
      ['watch', srcPath],
      { stdio: 'inherit' }
    );
    console.log(2);
    spawn.sync(
      wmlBin,
      ['start'],
      { stdio: 'inherit' }
    );
    console.log(3);
  });

commander
  .command("*", null, { noHelp: true })
  .action(() => {
    spawn(
      './node_modules/.bin/gluestick',
      commander.rawArgs.slice(2),
      { stdio: 'inherit' }
    );
  });

commander.parse(process.argv);
