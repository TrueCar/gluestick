const process = require("process");
const inquirer = require("inquirer");
const fs = require("fs-extra");
const path = require("path");
const npmDependencies = require("../lib/npmDependencies");
const utils = require("../lib/utils");
const { isGluestickProject } = utils;
const logger = require("../lib/cliLogger");
const cliColorScheme = require("../lib/cliColorScheme");
const { highlight, filename } = cliColorScheme;

function copyTo (destination) {
  fs.copySync(path.join(__dirname, "../../templates/new"), destination);
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
  fs.renameSync(path.join(destination, "_gitignore"), path.join(destination, ".gitignore"));
}

module.exports = function (projectName) {
  const currentlyInProjectFolder = isGluestickProject();

  // No project name, or ran from inside an existing project install in current directory if approved
  if (!projectName || currentlyInProjectFolder) {
    logger.info(`You are about to initialize a new gluestick project at ${filename(process.cwd())}`);
    const question = {
      type: "confirm",
      name: "confirm",
      message: "Do you wish to continue?"
    };
    inquirer.prompt([question]).then(function (answers) {
      if (!answers.confirm) { return; }
      copyTo(process.cwd());
      return false;
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
  return true;
};

