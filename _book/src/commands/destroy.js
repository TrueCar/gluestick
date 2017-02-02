const fs = require("fs");
const path = require("path");
const inquirer = require("inquirer");
const logger = require("../lib/cliLogger");
const cliColorScheme = require("../lib/cliColorScheme");
const { highlight, filename } = cliColorScheme;

const availableCommands = {
  "container": "containers",
  "component": "components",
  "reducer": "reducers"
};

// @NOTE, we use async here because we use await later in the function
module.exports = async function (command, name) {
  // Validate the command type by verifying that it exists in `availableCommands`
  if (!availableCommands[command]) {
    logger.error(`${highlight(command)} is not a valid destroy command.`);
    logger.info(`Available destroy commands: ${Object.keys(availableCommands).map(c => highlight(c)).join(", ")}`);
    return;
  }

  const dirname = path.dirname(name);
  const basename = path.basename(name);

  // Validate the name by stripping out unwanted characters
  if (!basename || basename.length === 0) {
    logger.error("invalid arguments. You must specify a name.");
    return;
  }

  if (/\W/.test(basename)) {
    logger.error(`${highlight(basename)} is not a valid name.`);
    return;
  }

  // Possibly mutate the name by converting it to Pascal Case (only for container and component for now)
  const originalName = basename; // store original name for later
  let generatedFileName = basename;
  if (["container", "component"].indexOf(command) !== -1) {
    generatedFileName = generatedFileName.substr(0, 1).toUpperCase() + generatedFileName.substr(1);
  }
  if (["reducer", "action-creator"].indexOf(command) !== -1) {
    generatedFileName = generatedFileName.substr(0, 1).toLowerCase() + generatedFileName.substr(1);
  }

  // Remove the file
  const CWD = process.cwd();
  const generateRoot = path.join(CWD, "src", availableCommands[command]);
  const destinationRoot = path.resolve(generateRoot, dirname);
  const destinationPath = path.join(destinationRoot, generatedFileName + ".js");
  let fileExists = true;
  try {
    fs.statSync(destinationPath);
  }
  catch (e) {
    fileExists = false;
  }

  if (fileExists) {
    // If they typed a name that would normally be mutated, check with the user first before deleting the files
    if (originalName !== generatedFileName) {
      // @NOTE: We are using await so that we can wait for the result of the promise before moving on
      const continueDestroying = await new Promise((resolve) => {
        const question = {
          type: "confirm",
          name: "confirm",
          message: `You wanted to destroy ${filename(originalName)} but the generated name is ${filename(generatedFileName)}.\nWould you like to continue with destroying ${filename(generatedFileName)}?`
        };
        inquirer.prompt([question]).then(function (answers) {
          resolve(!!answers.confirm);
        });
      });

      // Since we used await, this code will not be executed until the promise above resolves
      if (!continueDestroying) { process.exit(); }
    }

    fs.unlinkSync(destinationPath);
    logger.success(`Removed file: ${filename(destinationPath)}`);
  }
  else {
    logger.error(`${filename(destinationPath)} does not exist`);
    return;
  }

  // If we destroyed a reducer, remove it from the reducers index
  if (command === "reducer") {
    const reducerIndexPath = path.resolve(process.cwd(), "src/reducers/index.js");
    try {
      const indexLines = fs.readFileSync(reducerIndexPath, {encoding: "utf8"}).split("\n");
      const reducerLine = `export { default as ${generatedFileName} } from "./${generatedFileName}"`;
      const newIndexLines = indexLines.filter((indexLine) => {
        // Only return lines from the reducer index that do not return the reducer
        // we just destroyed. Check for semi colon and non-semi colon lines
        return indexLine !== reducerLine && indexLine !== `${reducerLine};`;
      });
      fs.writeFileSync(reducerIndexPath, newIndexLines.join("\n"));
      logger.success(`${highlight(generatedFileName)} removed from reducer index ${filename(reducerIndexPath)}`);
    }
    catch (e) {
      logger.error("Unable to modify reducers index. Reducer not removed from index");
    }
  }

  // Remove the test file
  const testFolder = path.resolve(path.join(CWD, "test", availableCommands[command]), dirname);
  const testPath = path.join(testFolder, `${generatedFileName}.test.js`);
  let testFileExists = true;
  try {
    fs.statSync(testPath);
  }
  catch (e) {
    testFileExists = false;
  }

  if (testFileExists) {
    fs.unlinkSync(testPath);
    logger.success(`Removed file: ${filename(testPath)}`);
  }
  else {
    logger.error(`${filename(testPath)} does not exist`);
    return;
  }
};
