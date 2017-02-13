/* @flow */

/* DO NOT MODIFY */
const createTemplate = module.parent.createTemplate;
/* END OF DO NOT MODIFY */

const templatePackage = require('../templates/package')(createTemplate);
const template505hbs = require('../templates/505hbs')(createTemplate);
const templateIndex = require('../templates/Index')(createTemplate);
const templateGluestick = require('../templates/gluestick')(createTemplate);
const templateGitignore = require('../templates/gitignore')(createTemplate);
const templateEslintrc = require('../templates/eslintrc')(createTemplate);
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
const templateEntry = require('../templates/Entry')(createTemplate);
const templateApp = require('../templates/App')(createTemplate);
const templateAppServer = require('../templates/AppServer')(createTemplate);
const templateInitBrowser = require('../templates/InitBrowser')(createTemplate);
const templateReduxMiddleware = require('../templates/ReduxMiddleware')(createTemplate);
const templateRoutes = require('../templates/Routes')(createTemplate);
const templateWebpackAdditions = require('../templates/WebpackAdditions')(createTemplate);
const templateHomeApp = require('../templates/HomeApp')(createTemplate);
const templateNoMatchApp = require('../templates/NoMatchApp')(createTemplate);
const templateRecuder = require('../templates/Reducer')(createTemplate);


/**
 * Generator must export object with configuration or function that returns
 * object with configuration.
 * If export is a function, it will receive the following object as first argument:
 * {
 *   name: string; // name of entity specified on generate command execution
 *   dir: string; // additional directory specified on generate command execution
 *   generator: string; // generator name eg: component, reducer, container
 * }
 * Note: `dir` field will be appended to every entries' `path`.
 * `dir` will not be appended to `file` field in `modify` object, you will
 * need to do it yourself.
 */
module.exports = () => ({
  /**
   * Define single entry.
   * Type: Object
   *
   * Every entry can define it's own arguments that can extend and/or overwrite shared arguments:
   * args: { ... }
   * Type: Object
   *
   * To define multiple entries pass array of entries to `entires` property:
   * entries: [{
   *   path: ...,
   *   filename: ...,
   *   template: ...,
   * }, {
   *   path: ...,
   *   filename: ...,
   *   template: ...,
   * }]
   * Type: Array<Object>
   */
  entries: [
    {
      path: '/',
      filename: 'package.json',
      template: templatePackage,
      overwrite: true,
    },
    {
      path: '/',
      filename: '505.hbs',
      template: template505hbs,
    },
    {
      path: '/',
      filename: 'Index.js',
      template: templateIndex,
    },
    {
      path: '/',
      filename: '.gluestick',
      template: templateGluestick,
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
      filename: '.dockerignore',
      template: templateDockerignore,
    },
    {
      path: '/',
      filename: '.babelrc',
      template: templateBabelrc,
    },
    {
      path: '/src/components',
      filename: 'Home.js',
      template: templateHome,
    },
    {
      path: '/src/components',
      filename: 'MasterLayout.js',
      template: templateMasterLayout,
    },
    {
      path: '/src/config',
      filename: '.Dockerfile',
      template: templateDockerfile,
    },
    {
      path: '/src/config',
      filename: '.entry.js',
      template: templateEntry,
    },
    {
      path: '/src/config',
      filename: 'application.js',
      template: templateApp,
    },
    {
      path: '/src/config',
      filename: 'application.server.js',
      template: templateAppServer,
    },
    {
      path: '/src/config',
      filename: 'init.browser.js',
      template: templateInitBrowser,
    },
    {
      path: '/src/config',
      filename: 'redux-middleware.js',
      template: templateReduxMiddleware,
    },
    {
      path: '/src/config',
      filename: 'routes.js',
      template: templateRoutes,
    },
    {
      path: '/src/config',
      filename: 'webpack-additions.js',
      template: templateWebpackAdditions,
    },
    {
      path: '/src/containers',
      filename: 'HomeApp.js',
      template: templateHomeApp,
    },
    {
      path: '/src/containers',
      filename: 'NoMatchApp.js',
      template: templateNoMatchApp,
    },
    {
      path: '/src/reducers',
      filename: 'index.js',
      template: templateRecuder,
    },
    {
      path: '/src/entryPoints/',
      filename: '.empty',
      template: templateEmpty,
    },
    {
      path: '/src/mapEntryToGroup/',
      filename: '.empty',
      template: templateEmpty,
    },
    {
      path: '/src/components/__tests__',
      filename: 'Home.test.js',
      template: templateHomeTest,
    },
    {
      path: '/src/components/__tests__',
      filename: 'MasterLayout.test.js',
      template: templateMasterLayoutTest,
    },
    {
      path: '/src/containers/__tests__',
      filename: 'ContaineHome.test.js',
      template: templateContainerHomeTest,
    },
    {
      path: '/src/containers/__tests__',
      filename: 'NoMatchApp.test.js',
      template: templateNoMatchAppTest,
    },
    {
      path: '/src/entryPoints/__tests__',
      filename: '.empty',
      template: templateEmpty,
    },
    {
      path: '/src/mapEntryToGroup/__tests__',
      filename: '.empty',
      template: templateEmpty,
    },
    {
      path: '/src/reducers/__tests__',
      filename: '.empty',
      template: templateEmpty,
    },
    {
      path: '/src/actions/__tests__',
      filename: '.empty',
      template: templateEmpty,
    },
  ],
});
