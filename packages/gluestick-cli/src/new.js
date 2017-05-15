const path = require('path');
const fs = require('fs');
const mkdir = require('mkdirp');
const { execSync } = require('child_process');
const spawn = require('cross-spawn');
const commander = require('commander');
const glob = require('glob');
const chalk = require('chalk');
const generate = require('gluestick-generators').default;
const fetch = require('node-fetch');
const rimraf = require('rimraf');

module.exports = (appName, options, exitWithError) => {
  fetch('http://registry.npmjs.org/gluestick')
    .then(res => res.json())
    .then(json => {
      const packageDeps = {
        dependencies: {
          gluestick: json['dist-tags'].latest,
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
      try {
        generate(
          {
            generatorName: 'package',
            entityName: 'package',
            options: generatorOptions,
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
    });
};
