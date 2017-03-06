const path = require('path');
const fs = require('fs');
const mkdir = require('mkdirp');
const spawn = require('cross-spawn');
const commander = require('commander');
const glob = require('glob');

module.exports = (appName, options, exitWithError) => {
  const pathToApp = path.join(process.cwd(), appName);
  if (fs.existsSync(pathToApp)) {
    exitWithError(
      `Directory ${pathToApp} already exists`,
    );
  }
  if (options.dev) {
    const pathToGluestickRepo = path.join(process.cwd(), appName, '..', options.dev);
    const pathToGluestickPackages = path.join(pathToGluestickRepo, 'packages');
    let gluestickPackage = {};
    const packages = glob.sync('*', { cwd: pathToGluestickPackages })
      .filter((e) => e !== 'gluestick-cli');
    try {
      gluestickPackage = require(path.join(pathToGluestickRepo, 'package.json'));
    } catch (error) {
      exitWithError(
        `Development GlueStick path ${pathToGluestickRepo} is not valid`,
      );
    }
    if (gluestickPackage.name !== 'gluestick-packages') {
      exitWithError(
        `${pathToGluestickRepo} is not a path to GlueStick`,
      );
    }
    mkdir.sync(path.join(process.cwd(), appName, 'node_modules/.bin'));
    packages.forEach((e) => {
      const source = path.join(process.cwd(), options.dev, 'packages', e);
      const dest = path.join(process.cwd(), appName, 'node_modules', e);
      spawn.sync(
        'ln',
        ['-s', source, dest],
        {
          stdio: 'inherit',
        },
      );
    });
    spawn.sync(
      'ln',
      [
        '-s',
        path.join(process.cwd(), options.dev, 'packages/gluestick/bin/gluestick.js'),
        './node_modules/.bin/gluestick',
      ],
      {
        cwd: path.join(process.cwd(), appName),
        stdio: 'inherit',
      },
    );
  } else {
    mkdir.sync(path.join(process.cwd(), appName));
    spawn.sync(
      options.yarn ? 'yarn' : 'npm',
      ['install', 'gluestick'],
      {
        cwd: path.join(process.cwd(), appName),
        stdio: 'inherit',
      },
    );
  }
  spawn.sync(
    './node_modules/.bin/gluestick',
    commander.rawArgs.slice(2),
    {
      cwd: path.join(process.cwd(), appName),
      stdio: 'inherit',
    },
  );
};
