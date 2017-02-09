/* @flow */

import type { Context } from '../types';

const generator = require('../generator');

type GeneratorName = 'conatiner'
  | 'component'
  | 'reducer'
  | 'generator';

type Options = {
  functional?: boolean;
  genOptions?: string;
}

const generate = ({ config, logger }: Context, generatorName: GeneratorName, entityName: string,
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
};

module.exports = generate;
