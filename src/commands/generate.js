const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
const logger = require("../lib/logger");
const logsColorScheme = require("../lib/logsColorScheme");
const { highlight, filename } = logsColorScheme;

const availableCommands = {
  "container": "containers",
  "component": "components",
  "reducer": "reducers"
};

function replaceName (input, name) {
  return input.replace(/__\$NAME__/g, name);
}

module.exports = function (command, name, cb) {
  const CWD = process.cwd();

  // Validate the command type by verifying that it exists in `availableCommands`
  if (!availableCommands[command]) {
    logger.info(`Available generators: ${Object.keys(availableCommands).map(c => highlight(c)).join(", ")}`);
    return cb(`${highlight(command)} is not a valid generator.`);
  }

  // Validate the name by stripping out unwanted characters
  if (!name || name.length === 0) {
    return cb("invalid arguments. You must specify a name.");
  }

  if (/\W/.test(name)) {
    return cb(`${highlight(name)} is not a valid name.`);
  }

  // Possibly mutate the name by converting it to Pascal Case (only for container and component for now)
  if (["container", "component"].indexOf(command) !== -1) {
    name = name.substr(0, 1).toUpperCase() + name.substr(1);
  }
  if (["reducer", "action-creator"].indexOf(command) !== -1) {
    name = name.substr(0, 1).toLowerCase() + name.substr(1);
  }

  // Get the output string and destination filename
  let template;
  try {
    template = fs.readFileSync(path.resolve(__dirname, `../../templates/generate/${command}.js`), {encoding: "utf8"});
  }
  catch(e) {
    return cb("Couldn't read generator file");
  }

  template = replaceName(template, name);

  // Check if the file already exists before we write to it
  const destinationPath = path.join(CWD, "/src/", availableCommands[command] + "/" + name + ".js");
  let fileExists = true;
  try {
    fs.statSync(destinationPath);
  }
  catch (e) {
    fileExists = false;
  }

  if (fileExists) {
    return cb(`${filename(destinationPath)} already exists`);
  }

  // Write output to file
  fs.writeFileSync(destinationPath, template);
  logger.success(`New file created: ${filename(destinationPath)}`);

  // If we just generated a reducer, add it to the reducers index
  if (command === "reducer") {
    const reducerIndexPath = path.resolve(CWD, "src/reducers/index.js");
    try {
      // Get the file contents, but strip off any trailing whitespace. This sets us up
      // to place the new export on the last line, followed by a blank whitespace line at the end
      const indexFileContents = fs.readFileSync(reducerIndexPath, {encoding: "utf8"}).replace(/\s*$/, "");
      const newLine = `export { default as ${name} } from "./${name}";`;

      // Write back to the index file with the previous contents in addition to our new line and a blank line for git
      fs.writeFileSync(reducerIndexPath, `${indexFileContents}\n${newLine}\n\n`);
      logger.success(`${highlight(name)} added to reducer index ${filename(reducerIndexPath)}`);
    }
    catch (e) {
      return cb("Unable to modify reducers index. Reducer not added to index");
    }
  }

  // Write test file
  const testFolder = path.join(CWD, "/test/", availableCommands[command]);

  // Older generated projects don't have test/reducers or test/containers
  mkdirp.sync(testFolder);

  const testPath = path.join(testFolder, `/${name}.test.js`);
  let testTemplate;
  let testFileExists = true;

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
    testTemplate = fs.readFileSync(path.resolve(__dirname, `../../templates/generate/${command}.test.js`), {encoding: "utf8"});
  }
  catch (e) {
    return cb("Couldn't read generator file");
  }

  try {
    fs.writeFileSync(testPath, replaceName(testTemplate, name));
  }
  catch (e) {
    return cb("Couldn't create test file");
  }

  logger.success(`New file created: ${filename(testPath)}`);
  return cb();
};
