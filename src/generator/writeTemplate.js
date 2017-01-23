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
};
