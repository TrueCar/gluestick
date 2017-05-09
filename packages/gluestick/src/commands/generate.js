/* @flow */

import type { CommandAPI, Logger } from '../types';

const { highlight } = require('../cli/colorScheme');
const generator = require('gluestick-generators').default;

export type Options = {
  entryPoint?: string;
  functional?: boolean;
  genOptions?: string;
}

module.exports = ({ getLogger, getOptions }: CommandAPI, commandArguments: any[]) => {
  const logger: Logger = getLogger();

  logger.clear();
  logger.printCommandInfo();

  const options: Options = getOptions(commandArguments);
  const generatorName: string = commandArguments[0];
  const entityName: string = commandArguments[1];

  const filteredOptions = {
    ...JSON.parse(options.genOptions ? options.genOptions : '{}'),
    functional: options.functional,
    entryPoint: options.entryPoint,
  };

  const successMessageHandler = (
    genName: string, entity: string, results: { written: string[]; modified: string[] },
  ) => {
    logger.success(
      `${generatorName[0].toUpperCase()}${generatorName.slice(1)} ${highlight(entity)} created`,
    );
    if (results.written.length) {
      logger.info(`Files written:\n         -> ${results.written.join('\n         -> ')}`);
    }
    if (results.modified.length) {
      logger.info(`Files modifier:\n         -> ${results.modified.join('\n         -> ')}`);
    }
  };

  generator({
    generatorName,
    entityName,
    options: filteredOptions,
  }, logger, { successMessageHandler });
};
