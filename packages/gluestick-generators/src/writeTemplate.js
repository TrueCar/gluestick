/* @flow */
import type { WrittenTemplate } from './types';

const fs = require('fs');
const path = require('path');
const mkdir = require('mkdirp');

type Modification = {
  file: string,
  modifier: (content: string | null, file: string) => string,
};

/**
 * Writes template from single entry to file.
 * Returns path of written file.
 *
 * @param {Object} entryConfig Parsed entry config
 * @returns {string}
 */
const writeEntry = (entryConfig: Object): string => {
  const destinationDirectory: string = path.join(
    process.cwd(),
    entryConfig.path,
  );
  const outputPath: string = path.join(
    destinationDirectory,
    entryConfig.filename,
  );
  if (!entryConfig.overwrite && fs.existsSync(outputPath)) {
    throw new Error(`File ${outputPath} alredy exists\n`);
  }
  mkdir.sync(destinationDirectory);
  fs.writeFileSync(outputPath, entryConfig.template, 'utf-8');
  return outputPath;
};

/**
 * Apply modifications to file specified in modify filed of generator config.
 * Path of modified file.
 *
 * @param {Modification} modification Single modification.
 * @returns {string}
 */
const applyModification = (modification: Modification): string => {
  let absolutePath: string = path.join(process.cwd(), modification.file);

  if (
    !modification.file.startsWith('.') &&
    !path.extname(absolutePath).length
  ) {
    absolutePath += '.js';
  }

  mkdir.sync(path.dirname(absolutePath));

  const modifiedContent: string = modification.modifier(
    fs.existsSync(absolutePath) ? fs.readFileSync(absolutePath, 'utf-8') : null,
    absolutePath,
  );

  if (typeof modifiedContent === 'string') {
    fs.writeFileSync(absolutePath, modifiedContent, 'utf-8');
  } else if (modifiedContent) {
    throw new Error(`Modified content for ${absolutePath} must be a string\n`);
  }

  return absolutePath;
};

/**
 * Writes template from entries to file.
 *
 * @param {Object} generatorConfig Parsed generator config
 * @returns {WrittenTemplate}
 */

module.exports = (generatorConfig: Object): WrittenTemplate => {
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
