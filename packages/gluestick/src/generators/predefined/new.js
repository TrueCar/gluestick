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

const templateGitignore = require('../templates/gitignore')(createTemplate);
const templateDockerignore = require('../templates/dockerignore')(createTemplate);
const tag = require('../../../package.json').version;
const templateDockerfile = require('../templates/Dockerfile')(createTemplate, tag);
const templateEntryWrapper = require('../templates/EntryWrapper')(createTemplate);
const templateApp = require('../templates/application')(createTemplate);
const templateAppServer = require('../templates/application.server')(createTemplate);
const templateInitBrowser = require('../templates/init.browser')(createTemplate);
const templateReduxMiddleware = require('../templates/redux-middleware')(createTemplate);
const templateWebpackAdditions = require('../templates/webpack-additions')(createTemplate);
const templateGluestickPlugins = require('../templates/gluestick.plugins')(createTemplate);
const templateGluestickHooks = require('../templates/gluestick.hooks')(createTemplate);
const templateGluestickConfig = require('../templates/gluestick.config')(createTemplate);
const templateWebpackHooks = require('../templates/webpack.hooks')(createTemplate);
const templateCachingServer = require('../templates/caching.server')(createTemplate);

module.exports = (options: GeneratorOptions) => {
  const presetNewGenerator = require(getGeneratorPath('new'))({
    convertToCamelCase,
    convertToKebabCase,
    convertToPascalCase,
    convertToCamelCaseWithPrefix,
    createTemplate,
  })(options);

  const entries = [
    {
      path: '/',
      filename: '.gitignore',
      template: templateGitignore,
    },
    {
      path: '/',
      filename: '.dockerignore',
      template: templateDockerignore,
    },
    // Gluestick directory
    {
      path: 'gluestick',
      filename: 'EntryWrapper',
      template: templateEntryWrapper,
    },
    // Config
    {
      path: 'src',
      filename: 'gluestick.plugins.js',
      template: templateGluestickPlugins,
    },
    {
      path: 'src',
      filename: 'gluestick.hooks.js',
      template: templateGluestickHooks,
    },
    {
      path: 'src',
      filename: 'gluestick.config.js',
      template: templateGluestickConfig,
    },
    {
      path: 'src',
      filename: 'webpack.hooks.js',
      template: templateWebpackHooks,
    },
    {
      path: 'src/config',
      filename: '.Dockerfile',
      template: templateDockerfile,
    },
    {
      path: 'src/config',
      filename: 'application.js',
      template: templateApp,
    },
    {
      path: 'src/config',
      filename: 'application.server.js',
      template: templateAppServer,
    },
    {
      path: 'src/config',
      filename: 'init.browser.js',
      template: templateInitBrowser,
    },
    {
      path: 'src/config',
      filename: 'redux-middleware.js',
      template: templateReduxMiddleware,
    },
    {
      path: 'src/config',
      filename: 'webpack-additions.js',
      template: templateWebpackAdditions,
    },
    {
      path: 'src/config',
      filename: 'caching.server.js',
      template: templateCachingServer,
    },
  ];

  return {
    ...presetNewGenerator,
    entries: [
      ...presetNewGenerator.entries,
      ...entries,
    ],
  };
};
