/* @flow */
import type { GeneratorOptions } from '../../types';

/* DO NOT MODIFY */
const createTemplate = module.parent.createTemplate;
/* END OF DO NOT MODIFY */

const templatePackage = require('../templates/package')(createTemplate);
const template505hbs = require('../templates/505hbs')(createTemplate);
const templateIndex = require('../templates/Index')(createTemplate);
const templateGitignore = require('../templates/gitignore')(createTemplate);
const templateEslintrc = require('../templates/eslintrc')(createTemplate);
const templateFlowConfig = require('../templates/_flowconfig')(createTemplate);
const templateDockerignore = require('../templates/dockerignore')(createTemplate);
const templateBabelrc = require('../templates/babelrc')(createTemplate);
const templateHomeTest = require('../templates/HomeTest')(createTemplate);
const templateMasterLayoutTest = require('../templates/MasterLayoutTest')(createTemplate);
const templateContainerHomeTest = require('../templates/ContainerHomeTest')(createTemplate);
const templateNoMatchAppTest = require('../templates/NoMatchAppTest')(createTemplate);
const templateEmpty = require('../templates/Empty')(createTemplate);
const templateHome = require('../templates/Home')(createTemplate);
const templateMasterLayout = require('../templates/MasterLayout')(createTemplate);
const tag = require('../../../package.json').version;
const templateDockerfile = require('../templates/Dockerfile')(createTemplate, tag);
const templateEntryWrapper = require('../templates/EntryWrapper')(createTemplate);
const templateApp = require('../templates/App')(createTemplate);
const templateAppServer = require('../templates/AppServer')(createTemplate);
const templateInitBrowser = require('../templates/InitBrowser')(createTemplate);
const templateReduxMiddleware = require('../templates/ReduxMiddleware')(createTemplate);
const templateRoutes = require('../templates/Routes')(createTemplate);
const templateWebpackAdditions = require('../templates/WebpackAdditions')(createTemplate);
const templateHomeApp = require('../templates/HomeApp')(createTemplate);
const templateNoMatchApp = require('../templates/NoMatchApp')(createTemplate);
const templateReducer = require('../templates/Reducer')(createTemplate);

const { flowVersion } = require('../constants');
// @TODO use config in new command when PR #571 is merged
const glueStickConfig = require('../../config/defaults/glueStickConfig');
const webpackConfig = require('../../config/webpack/webpack.config');

module.exports = (options: GeneratorOptions) => ({
  entries: [
    // Root directory files
    {
      path: '/',
      filename: 'package.json',
      template: templatePackage,
      overwrite: true,
      args: {
        dev: options.dev,
        appName: options.appName,
        flowVersion,
      },
    },
    {
      path: '/',
      filename: '.gitignore',
      template: templateGitignore,
    },
    {
      path: '/',
      filename: '.eslintrc',
      template: templateEslintrc,
    },
    {
      path: '/',
      filename: '.flowconfig',
      template: templateFlowConfig,
      args: {
        appName: options.appName,
        version: flowVersion,
        // $FlowFixMe review this after resolving the TODO mentioned above
        mapper: webpackConfig(glueStickConfig).resolve.alias,
      },
    },
    {
      path: '/',
      filename: '.dockerignore',
      template: templateDockerignore,
    },
    {
      path: '/',
      filename: '.babelrc',
      template: templateBabelrc,
    },
    // Gluestick directory
    {
      path: 'gluestick',
      filename: '505.hbs',
      template: template505hbs,
    },
    {
      path: 'gluestick',
      filename: 'EntryWrapper',
      template: templateEntryWrapper,
    },
    // Config
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
    // Shared
    {
      path: 'src/shared/actions',
      filename: '.empty',
      template: templateEmpty,
    },
    {
      path: 'src/shared/components',
      filename: '.empty',
      template: templateEmpty,
    },
    {
      path: 'src/shared/containers',
      filename: '.empty',
      template: templateEmpty,
    },
    {
      path: 'src/shared/reducers',
      filename: '.empty',
      template: templateEmpty,
    },
    // Main app
    {
      path: 'src/apps/main',
      filename: 'routes.js',
      template: templateRoutes,
    },
    {
      path: 'src/apps/main',
      filename: 'Index.js',
      template: templateIndex,
    },
    {
      path: 'src/apps/main/components',
      filename: 'Home.js',
      template: templateHome,
    },
    {
      path: 'src/apps/main/components',
      filename: 'MasterLayout.js',
      template: templateMasterLayout,
    },
    {
      path: 'src/apps/main/containers',
      filename: 'HomeApp.js',
      template: templateHomeApp,
    },
    {
      path: 'src/apps/main/containers',
      filename: 'NoMatchApp.js',
      template: templateNoMatchApp,
    },
    {
      path: 'src/apps/main/reducers',
      filename: 'index.js',
      template: templateReducer,
    },
    {
      path: 'src/apps/main/components/__tests__',
      filename: 'Home.test.js',
      template: templateHomeTest,
    },
    {
      path: 'src/apps/main/components/__tests__',
      filename: 'MasterLayout.test.js',
      template: templateMasterLayoutTest,
    },
    {
      path: 'src/apps/main/containers/__tests__',
      filename: 'ContaineHome.test.js',
      template: templateContainerHomeTest,
    },
    {
      path: 'src/apps/main/containers/__tests__',
      filename: 'NoMatchApp.test.js',
      template: templateNoMatchAppTest,
    },
    {
      path: 'src/apps/main/reducers/__tests__',
      filename: '.empty',
      template: templateEmpty,
    },
    {
      path: 'src/apps/main/actions/__tests__',
      filename: '.empty',
      template: templateEmpty,
    },
  ],
});
