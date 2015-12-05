var fs = require("fs");
var path = require("path");
var chalk = require("chalk");

const availableCommands = {
    "container": "src/containers/",
    "component": "src/components/",
    "reducer": "src/reducers/"
};

module.exports = function () {
    const command = process.argv[3];
    let name = process.argv[4];

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
    if (!name || name.length === 0) {
        console.log(chalk.red(`ERROR: invalid arguments. You must specify a name.`));
        return;
    }

    if (/\W/.test(name)) {
        console.log(chalk.red(`ERROR: ${chalk.yellow(name)} is not a valid name.`));
        return;
    }

    // Step 4: Possibly mutate the name by converting it to Pascal Case (only for container and component for now)
    if (["container", "component"].indexOf(command) !== -1) {
        name = name.substr(0, 1).toUpperCase() + name.substr(1);
    }

    // Step 5: Get the output string and destination filename
    let template;
    try {
        template = fs.readFileSync(path.resolve(__dirname, `../../generate/${command}.js`), {encoding: "utf8"})
    }
    catch(e) {
        console.log(e, chalk.red("ERROR: Couldn't read file"));
        return;
    }

    template = template.replace(/__\$NAME__/g, name);

    // Step 6: Check if the file already exists before we write to it
    const destinationPath = path.resolve(process.cwd(), availableCommands[command], name + ".js");
    let fileExists = true;
    try {
        fs.statSync(destinationPath);
    }
    catch (e) {
        fileExists = false;
    }

    if (fileExists) {
        console.log(chalk.red(`ERROR: ${chalk.yellow(destinationPath)} already exists`));
        return;
    }

    // Step 6: Write output to file
    fs.writeFileSync(destinationPath, template);
    console.log(chalk.green(`New file created: ${destinationPath}`));
};

