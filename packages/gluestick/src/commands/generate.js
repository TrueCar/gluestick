/* @flow */

import type { Context } from '../types';

const generator = require('gluestick-generators');

export type Options = {
  entryPoint?: string;
  functional?: boolean;
  genOptions?: string;
}

const generate = ({ config, logger }: Context, generatorName: string, entityName: string,
  options: Options) => {
  const filteredOptions = {
    ...JSON.parse(options.genOptions ? options.genOptions : '{}'),
    functional: options.functional,
    entryPoint: options.entryPoint,
  };
  generator({
    generatorName,
    entityName,
    options: filteredOptions,
  }, logger);
  process.exit(0);
};

module.exports = generate;
