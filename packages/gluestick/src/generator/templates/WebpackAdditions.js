/* @flow */
import type { CreateTemplate } from '../../types';

module.exports = (createTemplate: CreateTemplate) => createTemplate`
/* @flow */

/**
 * GlueStick uses universal-webpack to support server side rendering
 *
 * additionalLoaders syntax is idential to webpack 2 loader config:
 * additionalLoaders: [
 *   {
 *     test: RegExp,
 *     exclude: RegExp | string,
 *     use: [{
 *       loader: string,
 *       options: Object,
 *     }]
 *   }
 * ]
 * Every loader defined here must me installed.
 *
 * additionalAliases syntax:
 * additionalAliases: {
 *   [aliasName: string]: string[],
 * }
 * example:
 * additionalAliases: {
 *   "aliasName": ["path", "to", "location"]
 * }
 *
 * plugins follows the same syntax as in webpack 2
 *
 * vendor syntax: string[]
 * vendor is an array of files to add to vendor bundle resolved relatively to project root
 */

type Loader = {
  test: RegExp | string;
  exclude?: RegExp | string;
  use: [{
    loader: string;
    options?: Object;
  }],
  [key: string]: ?any;
}

type WebpackAdditions = {
  additionalLoaders: Loader[];
  additionalAliases: { [key: string]: string[] };
  plugins: string[];
  vendor: string[];
}

const webpackAdditions: WebpackAdditions = {
  additionalLoaders: [],
  additionalAliases: {},
  plugins: [],
  vendor: []
};

module.exports = webpackAdditions;
`;
