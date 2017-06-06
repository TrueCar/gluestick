const path = require('path');
const fs = require('fs');
const mkdir = require('mkdirp');
const spawn = require('cross-spawn');
const commander = require('commander');
const glob = require('glob');
const chalk = require('chalk');
const generate = require('gluestick-generators').default;
const fetch = require('node-fetch');
const rimraf = require('rimraf');

const ensureDevelopmentPathIsValid = (pathToGluestickRepo, exitWithError) => {
  let gluestickPackage = {};
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
};

const getDevelopmentDependencies = ({ dev }, pathToGluestickPackages) => {
  return glob.sync('*', { cwd: pathToGluestickPackages })
    .filter(name => name !== 'gluestick-cli')
    .reduce((acc, key) => {
      return { ...acc, [key]: `file:${path.join('..', dev, 'packages', key)}` };
    }, {});
};

module.exports = (appName, options, exitWithError) => {
  const preset = options.preset || 'default';
  const api = 'http://registry.npmjs.org';
  Promise.all([
    fetch(`${api}/gluestick`),
    fetch(`${api}/gluestick-preset-${preset}`),
  ]).then(responses => Promise.all(responses.map(res => res.json())))
    .then(payloads => {
      const latestGluestickVersion = payloads[0]['dist-tags'].latest;
      const presetDependencies = payloads[1].versions[latestGluestickVersion].gsProjectDependencies;
      let gluestickDependencies = {
        gluestick: latestGluestickVersion,
      };

      if (options.dev) {
        const pathToGluestickRepo = path.join(process.cwd(), appName, '..', options.dev);
        const pathToGluestickPackages = path.join(pathToGluestickRepo, 'packages');
        ensureDevelopmentPathIsValid(pathToGluestickRepo, exitWithError);
        gluestickDependencies = getDevelopmentDependencies(options, pathToGluestickPackages);
      }

      const pathToApp = path.join(process.cwd(), appName);
      if (fs.existsSync(pathToApp)) {
        exitWithError(
          `Directory ${pathToApp} already exists`,
        );
      }

      mkdir.sync(path.join(process.cwd(), appName));

      const generatorOptions = {
        appName,
        preset,
        gluestickDependencies,
        presetDependencies,
      };

      process.chdir(appName);
      try {
        generate(
          {
            generatorName: 'packageJson',
            entityName: 'package',
            options: generatorOptions,
          },
          undefined,
          {
            successMessageHandler: () => {},
          },
        );

        const isYarnAvailable = !spawn.sync('yarn', ['-V']).error;
        if (!options.npm && !isYarnAvailable) {
          console.log(
            chalk.yellow.bgBlack('You are installing dependencies using npm, consider using yarn.'),
          );
        }

        spawn.sync(
          !options.npm && isYarnAvailable ? 'yarn' : 'npm',
          ['install'],
          {
            cwd: process.cwd(),
            stdio: 'inherit',
          },
        );
        // Remove --npm or -n options cause this is no longer needed in
        // gluestick new command.
        const args = commander.rawArgs.slice(2)
          .filter((v) => v !== '--npm' && v !== '-n');

        spawn.sync(
          './node_modules/.bin/gluestick',
          args,
          {
            cwd: process.cwd(),
            stdio: 'inherit',
          },
        );
      } catch (error) {
        rimraf.sync(
          // Make sure CWD includes appName, we don't want to remove other files
          process.cwd().includes(appName) ? process.cwd() : path.join(process.cwd(), appName),
        );
        console.error(error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error(chalk.red(error.message));
      console.error('This error may occur due to the following reasons:');
      console.error(` -> Cannot connect or make request to '${api}'`);
      console.error(' -> Specified preset was not found');
      process.exit(1);
    });
};
