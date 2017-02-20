/* @flow */

import type {
  Logger,
  Generator,
  WrittenTemplate,
  GeneratorOptions,
} from '../types';

const fs = require('fs');
const path = require('path');

const requireGenerator = require('./requireGenerator');
const parseConfig = require('./parseConfig');
const writeTemplate = require('./writeTemplate');

type Command = {
  generatorName: string;
  entityName: string;
  options?: GeneratorOptions;
}

/**
 * Starts generator routine.
 *
 * @param command {Object} { generatorName, entityName, entryPoint, options } Command object
 * @param logger {Object} logger Logger instance
 */
module.exports = (command: Command, logger: Logger): void => {
  const {
    generatorName,
    entityName,
    options = {},
  } = command;
  const {
    entryPoint,
  } = options;

  const predefinedGenerators = [
    'component',
    'reducer',
    'container',
  ];

  if (predefinedGenerators.find((element) => element === generatorName)) {
    if (!/^(shared|apps\/.+)$/.test(entryPoint)) {
      logger.error(entryPoint ? `${entryPoint} is not a valid entry point` : 'You did not specify an entry point');
      logger.info('Pass -E and a valid entry point: \'shared\' or \'apps/{validAppName}\'');
      return;
    }
    const entryPath = path.join('src', entryPoint);
    if (!fs.existsSync(entryPath)) {
      logger.error(`Path ${entryPath} does not exist`);
      return;
    }
  }

  if (!/^[a-zA-Z0-9/_-]+$/.test(entityName)) {
    logger.error('Invalid name specified');
    return;
  }

  const generator: Generator = requireGenerator(generatorName);
  const generatorConfig: Object = parseConfig(
    generator.config,
    {
      ...options,
      generator: generator.name,
      entryPoint,
      name: path.basename(entityName),
      dir: path.dirname(entityName),
    },
  );

  const results: WrittenTemplate = writeTemplate({ ...generatorConfig, options });
  logger.success(
    `${generator.name} ${entityName} generated successfully\n`
    + 'Files written: \n'
    + `  ${results.written.length ? results.written.join('\n  ') : '--'}`
    + '\nFiles modified: \n'
    + `  ${results.modified.length ? results.modified.join('\n  ') : '--'}`,
  );
};
