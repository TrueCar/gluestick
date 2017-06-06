/* @flow */
import type { GeneratorOptions } from '../../types';

/* DO NOT MODIFY */
const createTemplate = module.parent.createTemplate;
/* END OF DO NOT MODIFY */

const {
  convertToCamelCase,
  convertToKebabCase,
  convertToPascalCase,
  convertToCamelCaseWithPrefix,
} = require('../../utils');
const { getGeneratorPath } = require('../getDataFromPreset');

module.exports = (options: GeneratorOptions) => {
  return require(getGeneratorPath('app'))({
    convertToCamelCase,
    convertToKebabCase,
    convertToPascalCase,
    convertToCamelCaseWithPrefix,
    createTemplate,
  })(options);
};
