/* @flow */

import type {
  Context,
  Config,
  WebpackConfig,
  UniversalSettings,
  CompiledConfig,
  Logger,
  GSConfig,
  Request,
  EntriesConfig,
} from '../../types.js';

const logger: Logger = {
  success: jest.fn(),
  info: jest.fn(),
  warn: () => {},
  debug: () => {},
  error: jest.fn(),
  level: 'info',
};

const gsConfig: GSConfig = {
  protocol: '',
  host: '',
  ports: {
    client: 0,
    server: 0,
  },
  buildStaticPath: '',
  buildAssetsPath: '',
  buildRendererPath: '',
  assetsPath: '',
  sourcePath: '',
  sharedPath: '',
  appsPath: '',
  configPath: '',
  entryWrapperPath: '',
  clientEntryInitPath: '',
  serverEntriesPath: '',
  entriesPath: '',
  reduxMiddlewares: '',
  webpackChunks: '',
  proxyLogLevel: '',
  webpackStats: '',
  debugWatchDirectories: [],
  defaultErrorTemplatePath: '',
  customErrorTemplatePath: '',
  autoUpgrade: {
    added: [],
    changed: [],
  },
};

const client: WebpackConfig = {
  resolve: {},
  module: {},
};
const server: WebpackConfig = {};

const universalSettings: UniversalSettings = {
  server: {
    input: '',
    output: '',
  },
};

const webpackConfig: CompiledConfig = {
  universalSettings,
  client,
  server,
};

const config: Config = {
  GSConfig: gsConfig,
  webpackConfig,
  plugins: [],
};

const context: Context = { config, logger };

const request: Request = {
  hostname: 'localhost',
  url: '/',
  headers: { 'user-agent': '' },
  method: 'GET',
};

const entriesConfig: EntriesConfig = {
  '/': {
    component: 'component',
    reducers: 'reducers',
    routes: 'routes',
  },
};

const commandApi = {
  getOptions: args => args[args.length - 1],
  getLogger: () => ({
    level: 'test',
    clear: jest.fn(),
    log: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
    print,
    printCommandInfo: jest.fn(),
  }),
  getContextConfig: () => ({}),
  getGluestickConfig: () => ({}),
  getPlugins: () => [],
  getWebpackConfig: () => ({}),
  isGluestickProject: () => true,
};

module.exports = {
  commandApi,
  context,
  config,
  logger,
  webpackConfig,
  universalSettings,
  gsConfig,
  request,
  entriesConfig,
};
