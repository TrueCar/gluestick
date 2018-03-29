/* @flow */
import type { GSConfig } from 'application-config';

export type { GSConfig } from 'application-config';
export type { Entries } from 'project-entries';
export type { EntriesConfig } from 'project-entries-config';

export type ProjectConfig = {
  [key: string]: any,
};

export type WebpackConfigEntry = string | boolean | Object | any[];

export type WebpackConfig = {
  externals?: any[],
  resolve?: {
    extensions?: string[],
    alias?: {
      [key: string]: string,
    },
  },
  [key: string]: WebpackConfigEntry,
};

export type UniversalSettings = {
  server: {
    input: string,
    output: string,
  },
};

export type CompiledConfig = {
  universalSettings: UniversalSettings,
  client: WebpackConfig,
  server: WebpackConfig,
  vendor?: WebpackConfig,
};

export type Config = {
  projectConfig?: ProjectConfig,
  GSConfig: GSConfig,
  webpackConfig: CompiledConfig,
};

export type Logger = BaseLogger & {
  pretty: boolean,
  clear: () => void,
  log: (type: string, title: string, ...args: any[]) => void,
  print: (...args: any[]) => void,
  printCommandInfo: () => void,
  fatal: (...args: any[]) => void,
  resetLine: () => void,
};

export type BaseLogger = {
  level?: string,
  success: (...args: any[]) => void,
  info: (...args: any[]) => void,
  warn: (...args: any[]) => void,
  debug: (...args: any[]) => void,
  error: (...args: any[]) => void,
};

export type CommandAPI = {
  getOptions: Function,
  getLogger: Function,
  isGluestickProject: Function,
  getPlugins: Function,
  getGluestickConfig: Function,
  getWebpackConfig: Function,
  getContextConfig: Function,
};

export type CLIContext = {
  config: Config,
  logger: Logger,
};

export type Context = {
  config: Config,
  logger: BaseLogger,
};

export type UniversalWebpackConfigurator = (options: any) => WebpackConfig;

export type Question = {
  type: string,
  name: string,
  message: string,
};

export type CreateTemplate = (
  interpolations: Array<*>,
  strings: Array<string>,
) => (args: Object) => string;

export type Generator = {
  name: string,
  config: any,
};

export type WrittenTemplate = {
  written: string[],
  modified: string[],
};

export type GeneratorOptions = {
  [key: string]: any,
};

export type PredefinedGeneratorOptions = {
  name: string,
  dir?: string,
  entryPoint: string,
};

export type Compiler = {
  run: (error: any) => void,
  plugin: (event: string, callback: Function) => void,
};

export type Response = {
  status: (code: number) => void,
  sendStatus: (code: number) => void,
  send: (value: string | Object | Buffer) => void,
  set: (header: { [key: string]: string }) => void,
  redirect: (code: number, location: string) => void,
  header: (header: string, value: string) => void,
  status: (code: number) => Response,
  json: (json: Object) => void,
};

export type Request = {
  url: string,
  hostname: string,
  headers: Object,
  method: string,
};

export type RenderRequirements = {
  Component: Function,
  routes: Function,
  reducers: Object,
  config: ?Object,
  name: string,
  key: string,
};

export type RenderOutput = {
  responseString: string,
  rootElement: Object,
};

export type GetCachedIfProd = (req: Request, cache?: Object) => string | null;
export type SetCacheIfProd = (
  req: Request,
  value: string,
  maxAge?: number,
  cache?: Object,
) => void;

export type CacheManager = {
  getCachedIfProd: GetCachedIfProd,
  setCacheIfProd: SetCacheIfProd,
};

export type MismatchedModules = {
  [key: string]: {
    required: string,
    project: string,
    type: string,
  },
};

export type ProjectPackage = {
  dependencies: {
    [key: string]: string,
  },
  devDependencies: {
    [key: string]: string,
  },
};

export type UpdateDepsPromptResults = {
  shouldFix: boolean,
  mismatchedModules: MismatchedModules,
};

export type Hook = Function | Function[];

export type GSHooks = {
  preInitServer?: Function,
  postServerRun?: Hook,
  preRenderFromCache?: Hook,
  postRenderRequirements?: Hook,
  preRedirect?: Hook,
  postRenderProps?: Hook,
  postGetCurrentRoute?: Hook,
  postRender?: Hook,
  error?: Hook,
};

export type WebpackHooks = {
  webpackClientConfig?: Hook,
  webpackServerConfig?: Hook,
  webpackVendorDllConfig?: Hook,
};

export type Plugin = {
  name: string,
  meta: {
    [key: string]: any,
  },
  body: Function | null,
  options: Object,
};

export type ConfigPlugin = {
  name: string,
  meta: {
    [key: string]: any,
  },
  preOverwrites: {
    sharedWebpackConfig?: (config: WebpackConfig) => WebpackConfig,
  },
  postOverwrites: {
    gluestickConfig?: (config: GSConfig) => void,
    clientWebpackConfig?: (config: WebpackConfig) => WebpackConfig,
    serverWebpackConfig?: (config: WebpackConfig) => WebpackConfig,
    vendorDllWebpackConfig?: (config: WebpackConfig) => WebpackConfig,
  },
};

export type RuntimePlugin = {
  name: string,
  meta: {
    [key: string]: any,
  },
  body: {
    rootWrapper?: (component: Object) => Object,
  },
};

export type ServerPlugin = {
  name: string,
  meta: {
    [key: string]: any,
  },
  renderMethod: Function,
  hooks: GSHooks,
  logger: Logger,
};

export type RenderMethod = (
  root: Object,
  styleTags: Object[],
) => { body: string, head: Object[], additionalScripts?: Object[] };

export type BabelOptions = {
  plugins: Array<string | mixed[]>,
  presets: Array<string | mixed[]>,
};
