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
  info: () => {},
  warn: () => {},
  debug: () => {},
  error: jest.fn(),
};

const gsConfig: GSConfig = {
  protocol: '',
  host: '',
  ports: {
    client: 0,
    server: 0,
  },
  buildAssetsPath: '',
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
  debugWatchDirectories: [],
  defaultErrorTemplatePath: '',
  customErrorTemplatePath: '',
  autoUpgrade: {
    added: [],
    changed: [],
  },
};

const client: WebpackConfig = {};
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
};

const entriesConfig: EntriesConfig = {
  '/': {
    component: 'component',
    reducers: 'reducers',
    routes: 'routes',
  },
};

module.exports = {
  context,
  config,
  logger,
  webpackConfig,
  universalSettings,
  gsConfig,
  request,
  entriesConfig,
};
