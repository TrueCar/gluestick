var fs = require("fs");
var path = require("path");
var chalk = require("chalk");

var availableCommands = {
  "container": "containers",
  "component": "components",
  "reducer": "reducers"
};

function replaceName (input, name) {
  return input.replace(/__\$NAME__/g, name);
}

module.exports = function () {
  var command = process.argv[3];
  var name = process.argv[4];

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
  if (["reducer", "action-creator"].indexOf(command) !== -1) {
    name = name.substr(0, 1).toLowerCase() + name.substr(1);
  }

  // Step 5: Get the output string and destination filename
  var template;
  try {
    template = fs.readFileSync(path.resolve(__dirname, `../../generate/${command}.js`), {encoding: "utf8"})
  }
  catch(e) {
    console.log(e, chalk.red("ERROR: Couldn't read generator file"));
    return;
  }

  template = replaceName(template, name);

  // Step 6: Check if the file already exists before we write to it
  var destinationPath = path.join(process.cwd(), "/src/", availableCommands[command] + "/" + name + ".js");
  var fileExists = true;
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

  // Step 7: If we just generated a reducer, add it to the reducers index
  if (command === "reducer") {
    var reducerIndexPath = path.resolve(process.cwd(), "src/reducers/index.js");
    try {
      var indexLines = fs.readFileSync(reducerIndexPath, {encoding: "utf8"}).split("\n");
      var lastLineIndex = indexLines.length - 1;
      var newLine = `export { default as ${name} } from "./${name}"`;
      if (indexLines[lastLineIndex] === "") {
        indexLines.splice(lastLineIndex, 1, newLine);
        indexLines.push("");
      }
      else {
        indexLines.push(newLine);
        indexLines.push("");
      }
      fs.writeFileSync(reducerIndexPath, indexLines.join("\n"));
      console.log(chalk.yellow(`${name} added to reducer index ${reducerIndexPath}`));
    }
    catch (e) {
      console.log(chalk.red(`ERROR: Unable to modify reducers index. Reducer not added to index`));
      return;
    }
  }

  // Step 8: Write test file for component
  if(command === "component") {
    var testPath = path.join(process.cwd(), "/test/", availableCommands[command], `/${name}.test.js`);
    var testTemplate;
    var testFileExists = true;
    try {
      fs.statSync(testPath);
    }
    catch (e) {
      testFileExists = false;
    }

    if (testFileExists) {
      console.log(chalk.yellow(`WARNING: Unable to create test file for ${name} because it already exists`));
      return;
    }

    try {
      testTemplate = fs.readFileSync(path.resolve(__dirname, `../../generate/${command}.test.js`), {encoding: "utf8"})
    }
    catch (e) {
      console.log(e, chalk.red("ERROR: Couldn't read generator file"));
      return;
    }

    try {
      fs.writeFileSync(testPath, replaceName(testTemplate, name));
    }
    catch (e) {
      console.log(e, chalk.red("ERROR: Couldn't create test file"));
      return;
    }

    console.log(chalk.green(`New file created: ${testPath}`));
  }
};

