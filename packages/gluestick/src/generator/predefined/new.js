/* @flow */
import type { GeneratorOptions } from '../../types';

/* DO NOT MODIFY */
const createTemplate = module.parent.createTemplate;
/* END OF DO NOT MODIFY */

const templateIndex = require('../templates/Index')(createTemplate);
const templateGitignore = require('../templates/gitignore')(createTemplate);
const templateEslintrc = require('../templates/_eslintrc')(createTemplate);
const templateFlowConfig = require('../templates/_flowconfig')(createTemplate);
const templateDockerignore = require('../templates/dockerignore')(createTemplate);
const templateBabelrc = require('../templates/babelrc')(createTemplate);
const templateHomeTest = require('../templates/HomeTest')(createTemplate);
const templateMasterLayoutTest = require('../templates/MasterLayoutTest')(createTemplate);
const templateContainerHomeTest = require('../templates/ContainerHomeTest')(createTemplate);
const templateNoMatchAppTest = require('../templates/NoMatchAppTest')(createTemplate);
const templateEmpty = require('../templates/Empty')(createTemplate);
const templateHome = require('../templates/Home')(createTemplate);
const templateHomeCss = require('../templates/HomeCss.js')(createTemplate);
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
const templateEntries = require('../templates/entries')(createTemplate);
const templateGluestickPlugins = require('../templates/gluestick.plugins')(createTemplate);
const templateGluestickHooks = require('../templates/gluestick.hooks')(createTemplate);
const templateGluestickConfig = require('../templates/gluestick.config')(createTemplate);
const templateWebpackHooks = require('../templates/webpack.hooks')(createTemplate);
const templateCachingServer = require('../templates/caching.server')(createTemplate);
const templateVendor = require('../templates/vendor')(createTemplate);

const { flowVersion, flowMapper } = require('../constants');

module.exports = (options: GeneratorOptions) => {
  const entries = [
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
        mapper: flowMapper,
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
    {
      path: 'src',
      filename: 'entries.json',
      template: templateEntries,
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
      path: 'src',
      filename: 'vendor.js',
      template: templateVendor,
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
    // Shared
    {
      path: 'src/shared/actions',
      filename: '.gitkeep',
      template: templateEmpty,
    },
    {
      path: 'src/shared/components',
      filename: '.gitkeep',
      template: templateEmpty,
    },
    {
      path: 'src/shared/containers',
      filename: '.gitkeep',
      template: templateEmpty,
    },
    {
      path: 'src/shared/reducers',
      filename: '.gitkeep',
      template: templateEmpty,
    },
    // Main app
    {
      path: 'src/apps/main/assets',
      filename: '.gitkeep',
      template: templateEmpty,
    },
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
      filename: 'Home.css',
      template: templateHomeCss,
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
      path: 'src/apps/main/actions',
      filename: '.gitkeep',
      template: templateEmpty,
    },
    {
      path: 'src/apps/main/reducers',
      filename: 'index.js',
      template: templateReducer,
    },
    {
      path: 'src/shared/assets',
      filename: '.gitkeep',
      template: templateEmpty,
    },
    {
      path: 'src/shared/reducers',
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
      filename: 'HomeApp.test.js',
      template: templateContainerHomeTest,
    },
    {
      path: 'src/apps/main/containers/__tests__',
      filename: 'NoMatchApp.test.js',
      template: templateNoMatchAppTest,
    },
    {
      path: 'src/apps/main/reducers/__tests__',
      filename: '.gitkeep',
      template: templateEmpty,
    },
    {
      path: 'src/apps/main/actions/__tests__',
      filename: '.gitkeep',
      template: templateEmpty,
    },
    {
      path: 'src/shared/actions/__tests__',
      filename: '.gitkeep',
      template: templateEmpty,
    },
    {
      path: 'src/shared/containers/__tests__',
      filename: '.gitkeep',
      template: templateEmpty,
    },
    {
      path: 'src/shared/components/__tests__',
      filename: '.gitkeep',
      template: templateEmpty,
    },
    {
      path: 'src/shared/reducers/__tests__',
      filename: '.gitkeep',
      template: templateEmpty,
    },
  ];
  return {
    entries: options.skipMain ? entries.filter(o => !o.path.includes('apps/main')) : entries,
  };
};
