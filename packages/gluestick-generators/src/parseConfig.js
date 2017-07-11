/* @flow */
const path = require('path');

type Entry = {
  path: string,
  filename: string,
  template: ((args?: Object) => string) | string,
  args?: Object,
  overwrite: boolean,
};

type Config = {
  entry?: Entry,
  entries?: Entry[],
  args?: Object,
  modify?: Object[],
};

type UserConfig = Config | ((options: Object) => Config);

/**
 * Parses single entry.
 *
 * @param {Entry} entry Entry to parse
 * @param {Object} commonArgs Base/common arguments to pass to template
 * Those aruments might be overwritten by entry-specific arguments
 * @param {Object} options Options to pass to functional entry
 * @returns {Entry}
 */
const parseEntry = (
  entry: Entry,
  commonArgs?: Object,
  options: Object,
): Entry => {
  const parsedEntry: Entry = { ...entry };

  if (
    !parsedEntry ||
    typeof parsedEntry.path !== 'string' ||
    typeof parsedEntry.filename !== 'string' ||
    typeof parsedEntry.template !== 'function'
  ) {
    throw new Error(`Entry in generator ${options.generator} is not valid`);
  }
  if (
    !path.extname(parsedEntry.filename).length &&
    parsedEntry.filename[0] !== '.'
  ) {
    parsedEntry.filename += '.js';
  }

  const args = { ...commonArgs, ...parsedEntry.args };
  // $FlowFixMe template is function and it overwritten itself with string that it returns
  parsedEntry.template = parsedEntry.template(args);
  return parsedEntry;
};

/**
 * Parses generator config.
 *
 * @param {UserConfig} config Generator config
 * @param {Object} options Options to pass to functional entry
 * @returns {Config}
 */
const parseConfig = (config: UserConfig, options: Object): Config => {
  const parsedConfig: Config =
    typeof config === 'function' ? config(options) : { ...config };
  if (!parsedConfig.entries && !parsedConfig.entry) {
    throw new Error(`No entry defined for generator ${options.generator}`);
  }
  if (Array.isArray(parsedConfig.entries)) {
    parsedConfig.entries = parsedConfig.entries.map(entry =>
      parseEntry(entry, parsedConfig.args, options),
    );
  } else {
    // $FlowFixMe entry is overwritten with parsed entry
    parsedConfig.entry = parseEntry(
      parsedConfig.entry,
      parsedConfig.args,
      options,
    );
  }
  return parsedConfig;
};

module.exports = parseConfig;
