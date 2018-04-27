const path = require('path');
const chalk = require('chalk');
const chokidar = require('chokidar');
const fs = require('fs-extra');

module.exports = exitWithError => {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  let packageContent = null;
  try {
    packageContent = require(packageJsonPath);
  } catch (error) {
    exitWithError(`Cannot find package.json in ${packageJsonPath}`);
  }
  try {
    if (/\d\.\d\.\d.*/.test(packageContent.dependencies.gluestick)) {
      exitWithError('Gluestick dependency does not contain valid path');
    }
  } catch (error) {
    exitWithError('Invalid package.json');
  }

  let gsDeps = null;
  let gsPackages = [];
  gsDeps = require(path.join(process.cwd(), 'package.json')).dependencies;
  gsPackages = Object.keys(gsDeps).filter(name => {
    return /^gluestick/.test(name) && !/\d+\.\d+\.\d+.*/.test(gsDeps[name]);
  });

  const gsDependenciesPath = gsPackages.map(name => {
    const newPath = gsDeps[name].replace('file://', '').replace('file:', '');
    return newPath[0] !== '/' ? path.join(process.cwd(), newPath) : newPath;
  });

  const babel = require(path.join(
    gsDependenciesPath[0],
    '../../node_modules/babel-core',
  ));
  const getPresets = presets => {
    return presets.map(preset => {
      if (Array.isArray(preset)) {
        return [
          require.resolve(
            path.join(
              gsDependenciesPath[0],
              `../../node_modules/babel-preset-${preset[0]}`,
            ),
          ),
          preset[1],
        ];
      }
      return require.resolve(
        path.join(
          gsDependenciesPath[0],
          `../../node_modules/babel-preset-${preset}`,
        ),
      );
    });
  };
  const getPlugins = (plugins = []) => {
    return plugins.map(plugin =>
      require.resolve(
        path.join(
          gsDependenciesPath[0],
          `../../node_modules/babel-plugin-${plugin}`,
        ),
      ),
    );
  };

  gsDependenciesPath.forEach((packagePath, index) => {
    const packageName = gsPackages[index];
    const packageBabelRc = JSON.parse(
      fs.readFileSync(path.join(packagePath, '.babelrc')).toString(),
    );
    const fileList = filePath => {
      if (/[\\/]build[\\/]/.test(filePath)) {
        return [];
      }

      // strip off path outside CWD so we're not replacing stuff on there!
      const relativePath = /packages\/[a-zA-Z-_]*\/(.*)/.exec(filePath)[1];

      const projectFile = path.resolve(
        process.cwd(),
        'node_modules',
        packageName,
        relativePath.replace('src', 'build'),
      );

      const localFile = path.resolve(
        packagePath,
        relativePath.replace('src', 'build'),
      );

      return [localFile, projectFile];
    };

    const watcher = chokidar.watch(`${packagePath}/**/*`, {
      ignored: [/(^|[/\\])\../, /.*node_modules.*/],
      persistent: true,
    });

    watcher.on('ready', () => {
      const copy = (filePath, type, typeColorFactory) => {
        fileList(filePath).forEach(destPath => {
          console.log(
            `${chalk.gray(`${filePath} -> ${destPath}`)} ${typeColorFactory(
              `[${type}]`,
            )}`,
          );
          if (path.extname(filePath) !== '.js') {
            fs.copySync(filePath, destPath);
          } else {
            babel.transformFile(
              filePath,
              {
                babelrc: false,
                presets: getPresets(packageBabelRc.presets),
                plugins: getPlugins(packageBabelRc.plugins),
              },
              (err, results) => {
                if (err) {
                  console.error(chalk.red(err));
                } else {
                  fs.writeFileSync(destPath, results.code);
                }
              },
            );
          }
        });
      };
      const remove = (filePath, type, typeColorFactory) => {
        fileList(filePath).forEach(destPath => {
          fs.remove(destPath, err => {
            if (err) {
              console.error(chalk.red(err));
            } else {
              console.log(
                `${chalk.gray(destPath)} ${typeColorFactory(`[${type}]`)}`,
              );
            }
          });
        });
      };
      console.log(chalk.blue(`Watching for changes in ${packageName}...`));
      watcher.on('add', filePath => copy(filePath, 'added', chalk.green));
      watcher.on('change', filePath => copy(filePath, 'changed', chalk.yellow));
      watcher.on('unlink', filePath => remove(filePath, 'removed', chalk.red));
      watcher.on('unlinkDir', filePath =>
        remove(filePath, 'removed dir', chalk.magenta),
      );
      watcher.on('addDir', filePath => {
        fileList(filePath).forEach(destPath => {
          fs.ensureDir(destPath, err => {
            if (err) {
              console.error(chalk.red(err));
            } else {
              console.log(
                `${chalk.gray(destPath)} ${chalk.cyan('[added dir]')}`,
              );
            }
          });
        });
      });
    });
  });
};
