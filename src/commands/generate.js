var fs = require("fs");
var path = require("path");
var mkdirp = require("mkdirp");
const logger = require("../lib/logger");
const logsColorScheme = require("../lib/logsColorScheme");
const { highlight, filename } = logsColorScheme;

var availableCommands = {
  "container": "containers",
  "component": "components",
  "reducer": "reducers"
};

function replaceName (input, name) {
  return input.replace(/__\$NAME__/g, name);
}

module.exports = function (command, name, cb) {
  var CWD = process.cwd();

  // Step 1: Check if we are in the root of a gluestick project by looking for the `.gluestick` file
  try {
    fs.statSync(path.join(CWD, ".gluestick"));
  }
  catch (e) {
    logger.info(`.gluestick file not found`);
    return cb(`${highlight("generate")} commands must be run from the root of a gluestick project.`);
  }

  // Step 2: Validate the command type by verifying that it exists in `availableCommands`
  if (!availableCommands[command]) {
    logger.info(`Available generators: ${Object.keys(availableCommands).map(c => highlight(c)).join(", ")}`);
    return cb(`${highlight(command)} is not a valid generator.`);
  }

  // Step 3: Validate the name by stripping out unwanted characters
  if (!name || name.length === 0) {
    return cb(`invalid arguments. You must specify a name.`);
  }

  if (/\W/.test(name)) {
    return cb(`${highlight(name)} is not a valid name.`);
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
    return cb("Couldn't read generator file");
  }

  template = replaceName(template, name);

  // Step 6: Check if the file already exists before we write to it
  var destinationPath = path.join(CWD, "/src/", availableCommands[command] + "/" + name + ".js");
  var fileExists = true;
  try {
    fs.statSync(destinationPath);
  }
  catch (e) {
    fileExists = false;
  }

  if (fileExists) {
    return cb(`${filename(destinationPath)} already exists`);
  }

  // Step 6: Write output to file
  fs.writeFileSync(destinationPath, template);
  logger.success(`New file created: ${filename(destinationPath)}`);

  // Step 7: If we just generated a reducer, add it to the reducers index
  if (command === "reducer") {
    var reducerIndexPath = path.resolve(CWD, "src/reducers/index.js");
    try {
      // Get the file contents, but strip off any trailing whitespace. This sets us up
      // to place the new export on the last line, followed by a blank whitespace line at the end
      var indexFileContents = fs.readFileSync(reducerIndexPath, {encoding: "utf8"}).replace(/\s*$/, "");
      var newLine = `export { default as ${name} } from "./${name}";`;

      // Write back to the index file with the previous contents in addition to our new line and a blank line for git
      fs.writeFileSync(reducerIndexPath, `${indexFileContents}\n${newLine}\n\n`);
      logger.success(`${highlight(name)} added to reducer index ${filename(reducerIndexPath)}`);
    }
    catch (e) {
      return cb(`Unable to modify reducers index. Reducer not added to index`);
    }
  }

  // Step 8: Write test file
  var testFolder = path.join(CWD, "/test/", availableCommands[command]);

  // Older generated projects don't have test/reducers or test/containers
  mkdirp.sync(testFolder);

  var testPath = path.join(testFolder, `/${name}.test.js`);
  var testTemplate;
  var testFileExists = true;

  try {
    fs.statSync(testPath);
  }
  catch (e) {
    testFileExists = false;
  }

  if (testFileExists) {
    return cb(`Unable to create test file for ${highlight(name)} because it already exists`);
  }

  try {
    testTemplate = fs.readFileSync(path.resolve(__dirname, `../../generate/${command}.test.js`), {encoding: "utf8"})
  }
  catch (e) {
    return cb(`Couldn't read generator file`);
  }

  try {
    fs.writeFileSync(testPath, replaceName(testTemplate, name));
  }
  catch (e) {
    return cb(`Couldn't create test file`);
  }

  logger.success(`New file created: ${filename(testPath)}`);
  return cb();
};
