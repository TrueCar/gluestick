/* @flow */

import type {
  Logger,
  Generator,
  WrittenTemplate,
  GeneratorOptions,
} from './types';

const path = require('path');

const { isValidEntryPoint } = require('./utils');
const requireGenerator = require('./requireGenerator');
const parseConfig = require('./parseConfig');
const writeTemplate = require('./writeTemplate');

type Command = {
  generatorName: string,
  entityName: string,
  options?: GeneratorOptions,
};

type Options = {
  pathToGenerator?: string,
  successMessageHandler: (
    generatorName: string,
    entityName: string,
    results: { written: string[], modified: string[] },
  ) => void,
};

const defaultLogger: Logger = {
  info: console.log,
  success: console.log,
  error: console.log,
  warn: console.log,
  debug: console.log,
};

/**
 * Starts generator routine.
 *
 * @param command {Object} { generatorName, entityName, entryPoint, options } Command object
 * @param logger {Object} logger Logger instance
 */
module.exports = (
  command: Command,
  logger: Logger = defaultLogger,
  { pathToGenerator, successMessageHandler }: Options = {},
): void => {
  const { generatorName, entityName, options = {} } = command;
  const { entryPoint = 'apps/main' } = options;

  const predefinedGenerators = ['component', 'reducer', 'container'];

  if (predefinedGenerators.find(element => element === generatorName)) {
    if (!isValidEntryPoint(entryPoint, logger)) {
      return;
    }
  }

  if (!/^[a-zA-Z0-9/_-]+$/.test(entityName)) {
    logger.error('Invalid name specified');
    return;
  }

  const generator: Generator = requireGenerator(generatorName, pathToGenerator);
  const generatorConfig: Object = parseConfig(generator.config, {
    ...options,
    generator: generator.name,
    entryPoint,
    name: path.basename(entityName),
    dir: path.dirname(entityName),
  });

  const results: WrittenTemplate = writeTemplate({
    ...generatorConfig,
    options,
  });
  if (successMessageHandler) {
    successMessageHandler(generator.name, entityName, results);
  } else {
    logger.success(
      `${generator.name} ${entityName} generated successfully\n` +
        'Files written: \n' +
        `  ${results.written.length ? results.written.join('\n  ') : '--'}` +
        '\nFiles modified: \n' +
        `  ${results.modified.length ? results.modified.join('\n  ') : '--'}`,
    );
  }
};
