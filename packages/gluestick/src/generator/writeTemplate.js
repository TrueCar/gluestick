const fs = require('fs');
const path = require('path');
const mkdir = require('mkdirp');

/**
 * Writes template from single entry to file.
 * Returns path of written file.
 *
 * @param {Object} entryConfig Parsed entry config
 * @returns {String}
 */
const writeEntry = (entryConfig) => {
  const destinationDirectory = path.join(process.cwd(), entryConfig.path);
  const outputPath = path.join(destinationDirectory, entryConfig.filename);
  if (fs.existsSync(outputPath)) {
    throw new Error(`File ${outputPath} alredy exists`);
  }
  mkdir.sync(destinationDirectory);
  fs.writeFileSync(outputPath, entryConfig.template, 'utf-8');
  return outputPath;
};

/**
 * Apply modifications to file specified in modify filed of generator config.
 * Path of modified file.
 *
 * @param {{ file: string, modificator: Function }} modification Single modification.
 * @returns {String}
 */
const applyModification = (modification) => {
  let absolutePath = path.join(process.cwd(), modification.file);
  if (!path.extname(absolutePath).length) {
    absolutePath += '.js';
  }
  mkdir.sync(path.dirname(absolutePath));
  const modifiedContent = modification.modifier(
    fs.existsSync(absolutePath) ? fs.readFileSync(absolutePath, 'utf-8') : null,
    absolutePath,
  );
  if (typeof modifiedContent === 'string') {
    fs.writeFileSync(absolutePath, modifiedContent, 'utf-8');
  } else if (modifiedContent) {
    throw new Error(`Modified content for ${absolutePath} must be a string`);
  }
  return absolutePath;
};

/**
 * Writes template from entries to file.
 *
 * @param {Object} generatorConfig Parsed generator config
 */
module.exports = exports = (generatorConfig) => {
  let writtenEntries = [];
  let modifiedFiles = [];
  if (Array.isArray(generatorConfig.entries)) {
    writtenEntries = generatorConfig.entries.map(writeEntry);
  } else {
    writtenEntries = [writeEntry(generatorConfig.entry)];
  }
  if (generatorConfig.modify && Array.isArray(generatorConfig.modify)) {
    modifiedFiles = generatorConfig.modify.map(applyModification);
  } else if (generatorConfig.modify) {
    modifiedFiles = [applyModification(generatorConfig.modify)];
  }
  return {
    written: writtenEntries,
    modified: modifiedFiles,
  };
};
