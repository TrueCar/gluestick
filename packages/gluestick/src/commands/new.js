const process = require('process');
const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const npmDependencies = require('../lib/npmDependencies');
const utils = require('../lib/utils');
// const logger = require('../lib/cliLogger');
const cliColorScheme = require('../lib/cliColorScheme');

const { highlight, filename } = cliColorScheme;
const { isGluestickProject } = utils;

function copyTo(destination) {
  fs.copySync(path.join(__dirname, '../../templates/new'), destination);
  process.chdir(destination);
  npmDependencies.install();

  // Unfortunately, the npm developers felt like it was a good idea to rename
  // .gitignore files to .npmignore, this was probably not a terrible idea
  // for most projects but it broke tons of generators. For that reason, we
  // instead renamed .gitignore to _gitignore and when you generate a new
  // project we need to manually rename that file.
  //
  // Relevant Issues:
  // https://github.com/npm/npm/issues/1862
  // https://github.com/npm/npm/issues/7252
  fs.renameSync(path.join(destination, '_gitignore'), path.join(destination, '.gitignore'));
}

module.exports = (cofnig, logger, projectName) => {
  const currentlyInProjectFolder = isGluestickProject();

  // Ran from inside an existing project, install in current directory if approved
  if (currentlyInProjectFolder) {
    logger.info(`You are about to initialize a new gluestick project at ${filename(process.cwd())}`);
    const question = {
      type: 'confirm',
      name: 'confirm',
      message: 'Do you wish to continue?',
    };
    inquirer.prompt([question]).then((answers) => {
      if (!answers.confirm) { return; }
      copyTo(process.cwd());
      _printInstructions(projectName);
    });

    return false;
  }

  // Anything other than alphanumeric and dashes is invalid
  if (!/^(\w|-)*$/.test(projectName)) {
    logger.warn(`Invalid name: ${highlight(projectName)}`);
    return false;
  }

  // Project name set, install in current working directory
  copyTo(path.join(process.cwd(), projectName));
  _printInstructions(projectName);
  return true;
};

function _printInstructions(/* projectName */) {
  // TODO: Replace logger.
  // logger.info(`${highlight('New GlueStick project created')} at ${filename(process.cwd())}`);
  // logger.info('To run your app and start developing');
  // logger.info(`    cd ${projectName}`);
  // logger.info('    gluestick start');
  // logger.info('    Point the browser to http://localhost:8888');
}
