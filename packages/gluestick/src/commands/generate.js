/* @flow */

import type { Context } from '../types';

const generator = require('../generator');

type Options = {
  functional?: boolean;
  genOptions?: string;
}

const generate = ({ config, logger }: Context, generatorName: string, entityName: string,
  options: Options) => {
  const filteredOptions = {
    functional: options.functional,
    ...JSON.parse(options.genOptions ? options.genOptions : '{}'),
  };
  generator({
    generatorName,
    entityName,
    options: filteredOptions,
  }, logger);
  process.exit(0);
};

module.exports = generate;
