/* @flow */
import type { Generator } from './types';

const fs = require('fs');
const path = require('path');
const createTemplate = require('./createTemplate');
const { convertToCamelCase, convertToKebabCase } = require('./utils');
// $FlowFixMe
module.createTemplate = createTemplate;

const PATH_TO_GLUESTICK_TEMPLATES: string = '../../build/generators/predefined';
const EXTERNAL: string = 'generators';
const INTERNAL: string = './generators';

const safeResolve = (moduleToResolve: string, ...args: string[]): string => {
  try {
    return path.join(require.resolve(moduleToResolve), ...args);
  } catch (e) {
    return '';
  }
};

const getPossiblePaths = (generatorName: string): string[] => {
  const paths: string[] = [
    path.join(process.cwd(), `${EXTERNAL}/${convertToCamelCase(generatorName)}.js`),
    path.join(process.cwd(), `${EXTERNAL}/${convertToKebabCase(generatorName)}.js`),
    safeResolve('gluestick', PATH_TO_GLUESTICK_TEMPLATES, `${convertToCamelCase(generatorName)}.js`),
    safeResolve('gluestick', PATH_TO_GLUESTICK_TEMPLATES, `${convertToKebabCase(generatorName)}.js`),
    path.join(__dirname, INTERNAL, `${convertToCamelCase(generatorName)}.js`),
    path.join(__dirname, INTERNAL, `${convertToKebabCase(generatorName)}.js`),
  ];
  return paths.filter((element: string): boolean => element.length > 0);
};

/**
 * Requires generator from predefined generators or from GlueStick project.
 *
 * @param {String} generatorName Generator name to require
 * @returns {Object}
 */
const requireGeneratorConfig = (
  generatorName: string,
  validPathToGenerator: ?string,
): Generator => {
  const paths: string[] = getPossiblePaths(generatorName);
  const pathToGenerator: ?string =
    validPathToGenerator || paths.find(generatorPath => fs.existsSync(generatorPath));

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
