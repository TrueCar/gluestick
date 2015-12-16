"use strict";

var process = require("process");
var spawn = require("child_process").spawn;
var chalk = require("chalk");
var inquirer = require("inquirer");
var fs = require("fs-extra");
var path = require("path");

function copyTo(destination) {
    fs.copySync(path.join(__dirname, "../../new"), destination);
    process.chdir(destination);
    spawn("npm", ["install"], { stdio: "inherit" });
}

module.exports = function () {
    var projectName = process.argv[3];

    var currentlyInProjectFolder = true;
    try {
        fs.statSync(path.join(process.cwd(), ".gluestick"));
    } catch (e) {
        currentlyInProjectFolder = false;
    }

    // No project name, or ran from inside an existing project install in current directory if approved
    if (!projectName || currentlyInProjectFolder) {
        console.log(chalk.yellow("You are about to initialize a new gluestick project at ") + chalk.cyan(process.cwd()));
        var question = {
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

    // project name set, install in current working directly / project name
    if (!/^(\w|-)*$/.test(projectName)) {
        console.log(chalk.red("Invalid name: " + projectName));
        return;
    }

    copyTo(path.join(process.cwd(), projectName));
};