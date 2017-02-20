/* @flow */
import type { Logger, Generator, WrittenTemplate, GeneratorOptions } from '../types';

const path = require('path');
const requireGenerator = require('./requireGenerator');
const parseConfig = require('./parseConfig');
const writeTemplate = require('./writeTemplate');

type Command = {
  generatorName: string,
  entityName: string,
  options: GeneratorOptions,
}

/**
 * Starts generator routine.
 *
 * @param {Object} { generatorName, entityName, options } Command object
 * @param {Object} logger Logger instance
 */

module.exports = ({ generatorName, entityName, options }: Command, logger: Logger): void => {
  if (!/^[a-zA-Z0-9/_-]+$/.test(entityName)) {
    throw new Error('Invalid name specified');
  }
  const generator: Generator = requireGenerator(generatorName);
  const generatorConfig: Object = parseConfig(
    generator.config,
    {
      ...options,
      generator: generator.name,
      name: path.basename(entityName),
      dir: path.dirname(entityName),
    },
  );

  const results: WrittenTemplate = writeTemplate(generatorConfig);
  logger.success(
    `${generator.name} ${entityName} generated successfully\n`
    + 'Files written: \n'
    + `  ${results.written.length ? results.written.join('\n  ') : '--'}`
    + '\nFiles modified: \n'
    + `  ${results.modified.length ? results.modified.join('\n  ') : '--'}`,
  );
};
