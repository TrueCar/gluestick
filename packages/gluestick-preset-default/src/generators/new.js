/* @flow */
import type { PredefinedGeneratorOptions, GeneratorUtils } from '../types';

const templateEslintrc = require('../templates/_eslintrc');
const templateFlowConfig = require('../templates/_flowconfig');
const templateBabelrc = require('../templates/babelrc');
const templateEmpty = require('../templates/empty');
const templateEntries = require('../templates/entries');
const templateIndex = require('../templates/Index');

const templateHome = require('../templates/Home');
const templateHomeApp = require('../templates/HomeApp');
const templateHomeCss = require('../templates/HomeCss.js');
const templateMasterLayout = require('../templates/MasterLayout');
const templateNoMatchApp = require('../templates/NoMatchApp');
const templateReducer = require('../templates/reducersIndex');
const templateRoutes = require('../templates/routes');


const { flowVersion, flowMapper } = require('../constants');

module.exports = ({ createTemplate }: GeneratorUtils) => (options: PredefinedGeneratorOptions) => {
  const entries = [
    {
      path: '/',
      filename: '.eslintrc',
      template: templateEslintrc(createTemplate),
    },
    {
      path: '/',
      filename: '.flowconfig',
      template: templateFlowConfig(createTemplate),
      args: {
        appName: options.appName,
        version: flowVersion,
        mapper: flowMapper,
      },
    },
    {
      path: '/',
      filename: '.babelrc',
      template: templateBabelrc(createTemplate),
    },
    {
      path: 'src',
      filename: 'entries.json',
      template: templateEntries(createTemplate),
    },
    // Shared
    {
      path: 'src/shared/actions',
      filename: '.gitkeep',
      template: templateEmpty(createTemplate),
    },
    {
      path: 'src/shared/actions/__tests__',
      filename: '.gitkeep',
      template: templateEmpty(createTemplate),
    },
    {
      path: 'src/shared/components',
      filename: '.gitkeep',
      template: templateEmpty(createTemplate),
    },
    {
      path: 'src/shared/components/__tests__',
      filename: '.gitkeep',
      template: templateEmpty(createTemplate),
    },
    {
      path: 'src/shared/containers',
      filename: '.gitkeep',
      template: templateEmpty(createTemplate),
    },
    {
      path: 'src/shared/containers/__tests__',
      filename: '.gitkeep',
      template: templateEmpty(createTemplate),
    },
    {
      path: 'src/shared/assets',
      filename: '.gitkeep',
      template: templateEmpty(createTemplate),
    },
    {
      path: 'src/shared/reducers',
      filename: '.gitkeep',
      template: templateEmpty(createTemplate),
    },
    {
      path: 'src/shared/reducers/__tests__',
      filename: '.gitkeep',
      template: templateEmpty(createTemplate),
    },
    // Main app
    {
      path: 'src/apps/main/assets',
      filename: '.gitkeep',
      template: templateEmpty(createTemplate),
    },
    {
      path: 'src/apps/main',
      filename: 'routes.js',
      template: templateRoutes(createTemplate),
    },
    {
      path: 'src/apps/main',
      filename: 'Index.js',
      template: templateIndex(createTemplate),
    },
    {
      path: 'src/apps/main/components',
      filename: 'Home.js',
      template: templateHome.source(createTemplate),
    },
    {
      path: 'src/apps/main/components/__tests__',
      filename: 'Home.test.js',
      template: templateHome.test(createTemplate),
    },
    {
      path: 'src/apps/main/components',
      filename: 'Home.css',
      template: templateHomeCss(createTemplate),
    },
    {
      path: 'src/apps/main/components',
      filename: 'MasterLayout.js',
      template: templateMasterLayout.source(createTemplate),
    },
    {
      path: 'src/apps/main/components/__tests__',
      filename: 'MasterLayout.test.js',
      template: templateMasterLayout.test(createTemplate),
    },
    {
      path: 'src/apps/main/containers',
      filename: 'HomeApp.js',
      template: templateHomeApp.source(createTemplate),
    },
    {
      path: 'src/apps/main/containers/__tests__',
      filename: 'HomeApp.test.js',
      template: templateHomeApp.test(createTemplate),
    },
    {
      path: 'src/apps/main/containers',
      filename: 'NoMatchApp.js',
      template: templateNoMatchApp.source(createTemplate),
    },
    {
      path: 'src/apps/main/containers/__tests__',
      filename: 'NoMatchApp.test.js',
      template: templateNoMatchApp.test(createTemplate),
    },
    {
      path: 'src/apps/main/actions',
      filename: '.gitkeep',
      template: templateEmpty(createTemplate),
    },
    {
      path: 'src/apps/main/reducers',
      filename: 'index.js',
      template: templateReducer(createTemplate),
    },
    {
      path: 'src/apps/main/reducers/__tests__',
      filename: '.gitkeep',
      template: templateEmpty(createTemplate),
    },
    {
      path: 'src/apps/main/actions/__tests__',
      filename: '.gitkeep',
      template: templateEmpty(createTemplate),
    },
  ];
  return {
    entries: options.skipMain ? entries.filter(o => !o.path.includes('apps/main')) : entries,
  };
};
