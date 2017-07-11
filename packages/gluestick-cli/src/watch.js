const path = require('path');
const chalk = require('chalk');
const chokidar = require('chokidar');
const fs = require('fs-extra');

module.exports = exitWithError => {
  const packagePath = path.join(process.cwd(), 'package.json');
  let packageContent = null;
  try {
    packageContent = require(packagePath);
  } catch (error) {
    exitWithError(`Cannot find package.json in ${packagePath}`);
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
  gsPackages = Object.keys(gsDeps).filter(
    e => /^gluestick/.test(e) && !/\d+\.\d+\.\d+.*/.test(gsDeps[e]),
  );

  const gsDependenciesPath = gsPackages.map(e => {
    const newPath = gsDeps[e].replace('file://', '').replace('file:', '');
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

  gsDependenciesPath.forEach((e, i) => {
    const packageName = gsPackages[i];
    const packageBabelRc = JSON.parse(
      fs.readFileSync(path.join(e, '.babelrc')).toString(),
    );
    const convertFilePath = filePath => {
      return path.join(
        process.cwd(),
        'node_modules',
        packageName,
        /packages\/[a-zA-Z-_]*\/(.*)/.exec(filePath.replace('src', 'build'))[1],
      );
    };
    const watcher = chokidar.watch(`${e}/**/*`, {
      ignored: [/(^|[/\\])\../, /.*node_modules.*/],
      persistent: true,
    });
    watcher.on('ready', () => {
      const copy = (filePath, type, typeColorFactory) => {
        const destPath = convertFilePath(filePath);
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
      };
      const remove = (filePath, type, typeColorFactory) => {
        const destPath = convertFilePath(filePath);
        fs.remove(destPath, err => {
          if (err) {
            console.error(chalk.red(err));
          } else {
            console.log(
              `${chalk.gray(destPath)} ${typeColorFactory(`[${type}]`)}`,
            );
          }
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
        const destPath = convertFilePath(filePath);
        fs.ensureDir(destPath, err => {
          if (err) {
            console.error(chalk.red(err));
          } else {
            console.log(`${chalk.gray(destPath)} ${chalk.cyan('[added dir]')}`);
          }
        });
      });
    });
  });
};
