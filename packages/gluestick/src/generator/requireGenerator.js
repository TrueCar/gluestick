/* @flow */
import type { Generator } from '../types';

const fs = require('fs');
const path = require('path');
const createTemplate = require('./createTemplate');
// $FlowFixMe
module.createTemplate = createTemplate;

const PREDEFINED: string = 'predefined';
const EXTERNAL: string = 'generators';

const convertToCamelCase =
  (value: string): string => value.replace(/(-\w)/g, match => match[1].toUpperCase());

const convertToKebabCase = (value: string): string => {
  const parsedValue = value.replace(/([A-Z])/g, match => `-${match[0].toLowerCase()}`);
  return parsedValue[0] === '-' ? parsedValue.substring(1) : parsedValue;
};

const getPossiblePaths = (generatorName: string): string[] => [
  path.join(process.cwd(), `generators/${convertToCamelCase(generatorName)}.js`),
  path.join(process.cwd(), `generators/${convertToKebabCase(generatorName)}.js`),
  path.join(__dirname, `${PREDEFINED}/${convertToCamelCase(generatorName)}.js`),
  path.join(__dirname, `${EXTERNAL}/${convertToKebabCase(generatorName)}.js`),
];

/**
 * Requires generator from predefined generators or from GlueStick project.
 *
 * @param {String} generatorName Generator name to require
 * @returns {Object}
 */
const requireGeneratorConfig = (generatorName: string): Generator => {
  const paths: string[] = getPossiblePaths(generatorName);
  const pathToGenerator: ?string = paths.find(generatorPath => fs.existsSync(generatorPath));

  if (!pathToGenerator) {
    throw new Error(
      `Generator ${generatorName} was not found at paths:\n`
      + `  ${paths.join('\n  ')}`,
    );
  }
  return {
    name: path.basename(pathToGenerator, '.js'),
    config: require(pathToGenerator),
  };
};

module.exports = requireGeneratorConfig;
