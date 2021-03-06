const path = require('path');
const fs = require('fs');
const mkdir = require('mkdirp');
const spawn = require('cross-spawn');
const commander = require('commander');
const glob = require('glob');
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

      const isYarnAvailable = !spawn.sync('yarn', ['-v']).error;

      if (options.dev) {
        if (!isYarnAvailable) {
          exitWithError(`Yarn is a requirement for local developing.`);
        }

        const pathToGluestickRepo = path.join(
          process.cwd(),
          appName,
          '..',
          options.dev,
        );
        const pathToGluestickPackages = path.join(
          pathToGluestickRepo,
          'packages',
        );
        let gluestickPackage = {};
        const packages = glob
          .sync('*', { cwd: pathToGluestickPackages })
          .filter(e => e !== 'gluestick-cli');
        try {
          gluestickPackage = require(path.join(
            pathToGluestickRepo,
            'package.json',
          ));
        } catch (error) {
          exitWithError(
            `Development GlueStick path ${pathToGluestickRepo} is not valid`,
          );
        }
        if (gluestickPackage.name !== 'gluestick-packages') {
          exitWithError(`${pathToGluestickRepo} is not a path to GlueStick`);
        }
        packages.forEach(e => {
          packageDeps.dependencies[e] = `file:${path.join(
            '..',
            options.dev,
            'packages',
            e,
          )}`;
        });
      }

      const pathToApp = path.join(process.cwd(), appName);
      if (fs.existsSync(pathToApp)) {
        exitWithError(`Directory ${pathToApp} already exists`);
      }

      mkdir.sync(path.join(process.cwd(), appName));

      const generatorOptions = {
        gluestickDependencies: packageDeps.dependencies,
        appName,
      };

      process.chdir(appName);
      try {
        generate({
          generatorName: 'package',
          entityName: 'package',
          options: generatorOptions,
        });

        spawn.sync(
          !options.npm && isYarnAvailable ? 'yarn' : 'npm',
          ['install'],
          {
            cwd: process.cwd(),
            stdio: 'inherit',
          },
        );
        // Run the new project command gluestick _init; --npm or -n options are not used.
        const args = commander.rawArgs
          .slice(2)
          .filter(v => v !== '--npm' && v !== '-n');

        spawn.sync('./node_modules/.bin/gluestick', args, {
          cwd: process.cwd(),
          stdio: 'inherit',
        });
      } catch (error) {
        rimraf.sync(
          // Make sure CWD includes appName, we don't want to remove other files
          process.cwd().includes(appName)
            ? process.cwd()
            : path.join(process.cwd(), appName),
        );
        console.error(error);
        process.exit(1);
      }
    });
};
