const path = require('path');

/**
 * Parses single entry.
 *
 * @param {Object} entry Entry to parse
 * @param {Object} commonArgs Base/common arguments to pass to template
 * Those aruments might be overwritten by entry-specific arguments
 * @param {Object} options Options to pass to functional entry
 * @returns {Object}
 */
const parseEntry = (entry, commonArgs, options) => {
  const parsedEntry = Object.assign({}, parsedEntry, entry);
  if (
    !parsedEntry
    || typeof parsedEntry.path !== 'string'
    || typeof parsedEntry.filename !== 'string'
    || typeof parsedEntry.template !== 'function'
  ) {
    throw new Error(`Entry in generator ${options.generator} is not valid`);
  }
  if (!path.extname(parsedEntry.filename).length && parsedEntry.filename[0] !== '.') {
    parsedEntry.filename += '.js';
  }
  if (options.dir) {
    parsedEntry.path = `${parsedEntry.path}/${options.dir}`.replace(/\/\//, '/');
  }
  const args = Object.assign({}, commonArgs, parsedEntry.args);
  parsedEntry.template = parsedEntry.template(args);
  return parsedEntry;
};

/**
 * Parses generator config.
 *
 * @param {Object} config Generator config
 * @param {Object} options Options to pass to functional entry
 * @returns {Object}
 */
const parseConfig = (config, options) => {
  const parsedConfig = typeof config === 'function' ? config(options) : Object.assign({}, config);
  if (!parsedConfig.entries && !parsedConfig.entry) {
    throw new Error(`No entry defined for generator ${options.generator}`);
  }
  if (Array.isArray(parsedConfig.entries)) {
    parsedConfig.entries = parsedConfig.entries.map(
      entry => parseEntry(entry, parsedConfig.args, options),
    );
  } else {
    parsedConfig.entry = parseEntry(parsedConfig.entry, parsedConfig.args, options);
  }
  return parsedConfig;
};

module.exports = exports = parseConfig;
