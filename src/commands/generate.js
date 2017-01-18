const fs = require("fs-extra");
const path = require("path");
const logger = require("../lib/cliLogger");
const cliColorScheme = require("../lib/cliColorScheme");
const { highlight, filename } = cliColorScheme;

const availableCommands = {
  "container": "containers",
  "component": "components",
  "reducer": "reducers",
  "functionalComponent": "components"
};

function replaceName (input, name, localpath=null) {
  const replacedName = input.replace(/__\$NAME__/g, name);
  if (!localpath) {
    return replacedName;
  }
  return replacedName.replace(/__\$PATH__/g, localpath);
}

module.exports = function (command, name, options, cb) {
  const CWD = process.cwd();

  if (command === "component" && options.functional){
    command = "functionalComponent";
  }

  // Validate the command type by verifying that it exists in `availableCommands`
  if (!availableCommands[command]) {
    logger.info(`Available generators: ${Object.keys(availableCommands).map(c => highlight(c)).join(", ")}`);
    return cb(`${highlight(command)} is not a valid generator.`);
  }

  const dirname = path.dirname(name);
  const basename = path.basename(name);

  // Validate the name by stripping out unwanted characters
  if (!basename || basename.length === 0) {
    return cb("invalid arguments. You must specify a name.");
  }

  if (/\W/.test(basename)) {
    return cb(`${highlight(basename)} is not a valid name.`);
  }

  if (command === "reducer" && dirname !== ".") {
    return cb("directory generation is not supported for reducers");
  }

  // Possibly mutate the name by converting it to Pascal Case (only for container and component for now)
  let generatedFileName = basename;
  if (["container", "component", "functionalComponent"].indexOf(command) !== -1) {
    generatedFileName = generatedFileName.substr(0, 1).toUpperCase() + generatedFileName.substr(1);
  }
  if (["reducer", "action-creator"].indexOf(command) !== -1) {
    generatedFileName = generatedFileName.substr(0, 1).toLowerCase() + generatedFileName.substr(1);
  }

  // Get the output string and destination filename
  let template;
  try {
    template = fs.readFileSync(path.resolve(__dirname, `../../templates/generate/${command}.js`), {encoding: "utf8"});
  }
  catch(e) {
    return cb("Couldn't read generator file");
  }

  template = replaceName(template, generatedFileName);

  // Check if the file already exists before we write to it
  const srcRoot = path.join(CWD, "src");
  const generateRoot = path.join(srcRoot, availableCommands[command]);
  const destinationRoot = path.resolve(generateRoot, dirname);
  const destinationPath = path.join(destinationRoot, generatedFileName + ".js");

  if (destinationPath.indexOf(generateRoot) !== 0) {
    return cb(`${command} generation is not supported outside of ${path.relative(CWD, generateRoot)}`);
  }

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
  fs.mkdirsSync(destinationRoot);
  fs.writeFileSync(destinationPath, template);
  logger.success(`New file created: ${filename(destinationPath)}`);

  // If we just generated a reducer, add it to the reducers index
  if (command === "reducer") {
    const reducerIndexPath = path.resolve(CWD, "src/reducers/index.js");
    try {
      // Get the file contents, but strip off any trailing whitespace. This sets us up
      // to place the new export on the last line, followed by a blank whitespace line at the end
      const indexFileContents = fs.readFileSync(reducerIndexPath, {encoding: "utf8"}).replace(/\s*$/, "");
      const newLine = `export { default as ${generatedFileName} } from "./${generatedFileName}";`;

      // Write back to the index file with the previous contents in addition to our new line and a blank line for git
      fs.writeFileSync(reducerIndexPath, `${indexFileContents}\n${newLine}\n\n`);
      logger.success(`${highlight(generatedFileName)} added to reducer index ${filename(reducerIndexPath)}`);
    }
    catch (e) {
      return cb("Unable to modify reducers index. Reducer not added to index");
    }
  }

  // Write test file
  const testFolder = path.resolve(path.join(CWD, "test", availableCommands[command]), dirname);

  // Older generated projects don't have test/reducers or test/containers
  fs.mkdirsSync(testFolder);

  const testPath = path.join(testFolder, `/${generatedFileName}.test.js`);
  let testTemplate;
  let testFileExists = true;

  try {
    fs.statSync(testPath);
  }
  catch (e) {
    testFileExists = false;
  }

  if (testFileExists) {
    return cb(`Unable to create test file for ${highlight(generatedFileName)} because it already exists`);
  }

  try {
    testTemplate = fs.readFileSync(path.resolve(__dirname, `../../templates/generate/${command}.test.js`), {encoding: "utf8"});
  }
  catch (e) {
    return cb("Couldn't read generator file");
  }

  try {
    const generatedComponentPath = destinationPath.replace(srcRoot, "").replace(".js", "").slice(1);
    fs.writeFileSync(testPath, replaceName(testTemplate, generatedFileName, generatedComponentPath));
  }
  catch (e) {
    return cb("Couldn't create test file");
  }

  logger.success(`New file created: ${filename(testPath)}`);
  return cb();
};
