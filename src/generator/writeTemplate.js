const fs = require("fs");
const path = require("path");
const mkdir = require("mkdirp");

/**
 * Writes template from single entry to file.
 *
 * @param {Object} entryConfig Parsed entry config
 */
const writeEntry = entryConfig => {
  const destinationDirectory = path.join(process.cwd(), entryConfig.path);
  const outputPath = path.join(destinationDirectory, entryConfig.filename);
  if (fs.existsSync(outputPath)) {
    throw new Error(`File ${outputPath} alredy exists`);
  }
  mkdir.sync(destinationDirectory);
  fs.writeFileSync(outputPath, entryConfig.template, "utf-8");
};

/**
 * Apply modifications to file specified in modify filed of generator config.
 *
 * @param {{ file: string, modificator: Function }} modification Single modification.
 */
const applyModification = modification => {
  let absolutePath = path.join(process.cwd(), modification.file);
  if (!path.extname(absolutePath).length) {
    absolutePath += ".js";
  }
  mkdir(path.dirname(absolutePath));
  const modifiedContent = modification.modificator(
    fs.existsSync(absolutePath) ? fs.readFileSync(absolutePath, "utf-8") : null,
    absolutePath
  );
  if (typeof modifiedContent === "string") {
    fs.writeFileSync(absolutePath, modifiedContent, "utf-8");
  } else if (modifiedContent) {
    throw new Error(`Modified content for ${absolutePath} must be a string`);
  }
};

/**
 * Writes template from entries to file.
 *
 * @param {Object} generatorConfig Parsed generator config
 */
module.exports = exports = generatorConfig => {
  if (Array.isArray(generatorConfig.entries)) {
    generatorConfig.entries.forEach(writeEntry);
  } else {
    writeEntry(generatorConfig.entry);
  }
  if (generatorConfig.modify && Array.isArray(generatorConfig.modify)) {
    generatorConfig.modify.forEach(applyModification);
  } else if (generatorConfig.modify) {
    applyModification(generatorConfig.modify);
  }
};
