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
  .command("*", null, { noHelp: true })
  .action(() => {
    spawn(
      './node_modules/.bin/gluestick',
      commander.rawArgs.slice(2),
      { stdio: 'inherit' }
    );
  });

commander.parse(process.argv);