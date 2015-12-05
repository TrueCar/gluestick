var fs = require("fs");
var path = require("path");
var chalk = require("chalk");

const availableCommands = {
    "container": () => {},
    "component": () => {},
    "reducer": () => {}
};

module.exports = function () {
    const command = process.argv[3];
    const name = process.argv[4];

    // Step 1: Check if we are in the root of a gluestick project by looking for the `.gluestick` file
    try {
        fs.statSync(path.join(process.cwd(), ".gluestick"));
    }
    catch (e) {
        console.log(chalk.yellow(".gluestick file not found"));
        console.log(chalk.red("ERROR: `generate` commands must be run from the root of a gluestick project."));
        return;
    }

    // Step 2: Validate the command type by verifying that it exists in `availableCommands`
    if (!availableCommands[command]) {
        console.log(chalk.red(`ERROR: ${chalk.yellow(command)} is not a valid generator.`));
        console.log(chalk.yellow(`Available generators: ${JSON.stringify(availableCommands)}`));
        return;
    }

    // Step 3: Validate the name by stripping out unwanted characters

    // Step 4: Possibly mutate the name by converting it to Pascal Case

    // Step 5: Get the output string and destination filename

    // Step 6: Write output to file

};

