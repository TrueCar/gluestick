var fs = require("fs");
var path = require("path");
var chalk = require("chalk");
var inquirer = require("inquirer");

var availableCommands = {
  "container": "containers",
  "component": "components",
  "reducer": "reducers"
};

// @NOTE, we use async here because we use await later in the function
module.exports = async function (command, name) {
  // Step 1: Check if we are in the root of a gluestick project by looking for the `.gluestick` file
  try {
    fs.statSync(path.join(process.cwd(), ".gluestick"));
  }
  catch (e) {
    console.log(chalk.yellow(".gluestick file not found"));
    console.log(chalk.red("ERROR: `destroy` commands must be run from the root of a gluestick project."));
    return;
  }

  // Step 2: Validate the command type by verifying that it exists in `availableCommands`
  if (!availableCommands[command]) {
    console.log(chalk.red(`ERROR: ${chalk.yellow(command)} is not a valid destroy command.`));
    console.log(chalk.yellow(`Available destroy commands: ${JSON.stringify(availableCommands)}`));
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
  var originalName = name; // store original name for later
  if (["container", "component"].indexOf(command) !== -1) {
    name = name.substr(0, 1).toUpperCase() + name.substr(1);
  }
  if (["reducer", "action-creator"].indexOf(command) !== -1) {
    name = name.substr(0, 1).toLowerCase() + name.substr(1);
  }

  // Step 5: Remove the file
  var destinationPath = path.join(process.cwd(), "/src/", availableCommands[command] + "/" + name + ".js");
  var fileExists = true;
  try {
    fs.statSync(destinationPath);
  }
  catch (e) {
    fileExists = false;
  }

  if (fileExists) {
    // If they typed a name that would normally be mutated, check with the user first before deleting the files
    if (originalName !== name) {
      // @NOTE: We are using await so that we can wait for the result of the promise before moving on
      const continueDestroying = await new Promise((resolve, reject) => {
        const question = {
          type: "confirm",
          name: "confirm",
          message: `You wanted to destroy ${chalk.yellow(originalName)} but the generated name is ${chalk.green(name)}. Would you like to continue with destroying ${chalk.green(name)}?`
        };
        inquirer.prompt([question], function (answers) {
          if (!answers.confirm) resolve(false);
          resolve(true);
        });
      });

      // Since we used await, this code will not be executed until the promise above resolves
      if (!continueDestroying) process.exit();
    }

    fs.unlinkSync(destinationPath);
    console.log(`${chalk.red("Removed file:")} ${destinationPath}`);
  }
  else {
    console.log(chalk.red(`ERROR: ${chalk.yellow(destinationPath)} does not exist`));
    return;
  }

  // Step 6: If we destroyed a reducer, remove it from the reducers index
  if (command === "reducer") {
    var reducerIndexPath = path.resolve(process.cwd(), "src/reducers/index.js");
    try {
      const indexLines = fs.readFileSync(reducerIndexPath, {encoding: "utf8"}).split("\n");
      const reducerLine = `export { default as ${name} } from "./${name}"`;
      const newIndexLines = indexLines.filter((indexLine) => {
        // Only return lines from the reducer index that do not return the reducer
        // we just destroyed. Check for semi colon and non-semi colon lines
        return indexLine !== reducerLine && indexLine !== `${reducerLine};`;
      });
      fs.writeFileSync(reducerIndexPath, newIndexLines.join("\n"));
      console.log(chalk.red(`${name} removed`) + ` from reducer index ${reducerIndexPath}`);
    }
    catch (e) {
      console.log(chalk.red(`ERROR: Unable to modify reducers index. Reducer not removed from index`));
    }
  }

  // Step 7: Remove the test file
  var testPath = path.join(process.cwd(), "/test/", availableCommands[command], `/${name}.test.js`);
  var testFileExists = true;
  try {
    fs.statSync(testPath);
  }
  catch (e) {
    testFileExists = false;
  }

  if (testFileExists) {
    fs.unlinkSync(testPath);
    console.log(chalk.red(`Removed file: ${testPath}`));
  }
  else {
    console.log(chalk.red(`ERROR: ${chalk.yellow(testPath)} does not exist`));
    return;
  }
};
