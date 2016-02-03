const process = require("process");
const chalk = require("chalk");
const inquirer = require("inquirer");
const fs = require("fs-extra");
const path = require("path");
const npmDependencies = require("./npm-dependencies");

function copyTo (destination) {
  fs.copySync(path.join(__dirname, "../../new"), destination);
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
  var currentlyInProjectFolder = true;
  try {
    fs.statSync(path.join(process.cwd(), ".gluestick"));
  }
  catch (e) {
    currentlyInProjectFolder = false;
  }

  // No project name, or ran from inside an existing project install in current directory if approved
  if (!projectName || currentlyInProjectFolder) {
    console.log(chalk.yellow("You are about to initialize a new gluestick project at ") + chalk.cyan(process.cwd()));
    const question = {
      type: "confirm",
      name: "confirm",
      message: "Do you wish to continue?"
    };
    inquirer.prompt([question], function (answers) {
      if (!answers.confirm) return;
      copyTo(process.cwd());
      return;
    });

    return;
  }

  // Anything other than alphanumeric and dashes is invalid
  if (!/^(\w|-)*$/.test(projectName)) {
    console.log(chalk.red("Invalid name: " + projectName));
    return;
  }

  // Project name set, install in current working directory
  copyTo(path.join(process.cwd(), projectName));
};

