const path = require('path');
const fs = require('fs');
const mkdir = require('mkdirp');
const spawn = require('cross-spawn');
const commander = require('commander');
const glob = require('glob');
const which = require('shelljs').which;
const generate = require('gluestick-generators').default;
const version = require('./package.json').version;

module.exports = (appName, options, exitWithError) => {
  const packageDeps = {
    dependencies: {
      gluestick: version,
    },
  };
  if (options.dev) {
    const pathToGluestickRepo = path.join(process.cwd(), appName, '..', options.dev);
    const pathToGluestickPackages = path.join(pathToGluestickRepo, 'packages');
    let gluestickPackage = {};
    const packages = glob.sync('*', { cwd: pathToGluestickPackages }).filter((e) => e !== 'gluestick-cli');
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
    packages.forEach(e => {
      packageDeps.dependencies[e] = `file:${path.join('..', options.dev, 'packages', e)}`;
    });
  }

  const pathToApp = path.join(process.cwd(), appName);
  if (fs.existsSync(pathToApp)) {
    exitWithError(
      `Directory ${pathToApp} already exists`,
    );
  }
  mkdir.sync(path.join(process.cwd(), appName));

  const generatorOptions = {
    gluestickDependencies: packageDeps.dependencies,
    appName,
  };

  process.chdir(appName);

  generate(
    {
      generatorName: 'package',
      entityName: 'package',
      options: generatorOptions,
    },
  );

  spawn.sync(
    !options.npm && which('yarn') !== null ? 'yarn' : 'npm',
    ['install'],
    {
      cwd: process.cwd(),
      stdio: 'inherit',
    },
  );
  // Remove --npm or -n options cause this is no longer needed
  const args = commander.rawArgs.slice(2);
  if (args.indexOf('--npm') >= 0) {
    args.splice(args.indexOf('--npm'), 1);
  } else if (args.indexOf('-n') >= 0) {
    args.splice(args.indexOf('-n'), 1);
  }

  spawn.sync(
    './node_modules/.bin/gluestick',
    args,
    {
      cwd: process.cwd(),
      stdio: 'inherit',
    },
  );
};
