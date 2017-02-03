const path = require('path');
const fs = require('fs');
const mkdir = require('mkdirp');
const spawn = require('cross-spawn');
const commander = require('commander');

module.exports = (appName, options, exitWithError) => {
  let pathToGluestick = null;
  let gluestickPackage = {};
  try {
    pathToGluestick = path.join(process.cwd(), appName, options.dev ? options.dev : '/');
    if (options.dev) {
      gluestickPackage = require(path.join(pathToGluestick, 'package.json'));
    }
  } catch (error) {
    exitWithError(
      `Development GlueStick path ${pathToGluestick} is not valid`,
    );
  }
  if (options.dev && gluestickPackage.name !== 'gluestick') {
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
  const packageDeps = {
    dependencies: {
      gluestick: options.dev ? `file:${options.dev}` : '^1.0.0',
    },
  };
  fs.writeFileSync(path.join(
    process.cwd(), appName, 'package.json'),
    JSON.stringify(packageDeps),
  );
  spawn.sync(
    options.yarn ? 'yarn' : 'npm',
    ['install'],
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
};
