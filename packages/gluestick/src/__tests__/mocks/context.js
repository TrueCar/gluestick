/* @flow */

import type {
  Context,
  CLIContext,
  Config,
  WebpackConfig,
  UniversalSettings,
  CompiledConfig,
  CommandAPI,
  BaseLogger,
  GSConfig,
  Request,
  EntriesConfig,
} from '../../types.js';

const logger: BaseLogger = {
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
  buildDllPath: '',
  vendorSourcePath: '',
  webpackHooksPath: '',
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

const commandApi: CommandAPI = {
  getOptions: (args: any[]) => args[args.length - 1],
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
  getContextConfig: () => ({
    GSConfig: gsConfig,
    webpackConfig,
  }),
  getGluestickConfig: () => ({}),
  getPlugins: () => [],
  getWebpackConfig: () => ({}),
  isGluestickProject: () => true,
};

const cliContext: CLIContext = {
  config: {
    GSConfig: gsConfig,
    webpackConfig,
  },
  logger: commandApi.getLogger(),
};

module.exports = {
  commandApi,
  cliContext,
  context,
  config,
  logger,
  webpackConfig,
  universalSettings,
  gsConfig,
  request,
  entriesConfig,
};
