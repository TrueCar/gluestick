const process = require("process");
const spawn = require("child_process").spawn;
const chalk = require("chalk");
const inquirer = require("inquirer");
const fs = require("fs-extra");
const path = require("path");

function copyTo (destination) {
    fs.copySync(path.join(__dirname, "../../new"), destination);
    process.chdir(destination);
    spawn("npm", ["install"], {stdio: "inherit"});
}

module.exports = function () {
    const projectName = process.argv[3];

    // No project name, install in current directory if approved
    if (!projectName) {
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

    // project name set, install in current working directly / project name
    if (!/^(\w|-)*$/.test(projectName)) {
        console.log(chalk.red("Invalid name: " + projectName));
        return;
    }

    copyTo(path.join(process.cwd(), projectName));
};

