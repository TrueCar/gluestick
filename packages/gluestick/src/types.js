/* @flow */

export type ProjectConfig = {
  [key: string]: any;
};

export type GSConfig = {
  protocol: string;
  host: string;
  ports: {
    client: number;
    server: number;
  };
  buildAssetsPath: string;
  assetsPath: string;
  sourcePath: string;
  sharedPath: string;
  appsPath: string;
  configPath: string;
  entryWrapperPath: string;
  clientEntryInitPath: string;
  serverEntriesPath: string;
  entriesPath: string;
  reduxMiddlewares: string;
  webpackChunks: string;
  proxyLogLevel: string;
  debugWatchDirectories: string[];
  defaultErrorTemplatePath: string;
  customErrorTemplatePath: string;
  autoUpgrade: {
    added: string[],
    changed: string[],
  };
  [key: string]: any;
};

export type WebpackConfigEntry = string | Object | any[];

export type WebpackConfig = {
  [key: string]: WebpackConfigEntry;
};

export type UniversalSettings = {
  server: {
    input: string;
    output: string;
  };
}

export type CompiledConfig = {
  universalSettings: UniversalSettings;
  client: WebpackConfig;
  server: WebpackConfig;
}

export type Config = {
  projectConfig?: ProjectConfig;
  GSConfig: GSConfig;
  webpackConfig: CompiledConfig;
  plugins: Plugin[];
};

export type Logger = LoggerTypes & {
  level?: string;
};

export type LoggerTypes = {
  success: Function;
  info: Function;
  warn: Function;
  debug: Function;
  error: Function;
}

export type Context = {
 config: Config;
 logger: Logger;
};

export type UniversalWebpackConfigurator = (options: any) => WebpackConfig;

export type Question = {
  type: string;
  name: string;
  message: string;
}

export type CreateTemplate = (
  interpolations: Array<*>,
  strings: Array<string>,
) => (args: Object) => string;

export type Generator = {
  name: string;
  config: any;
}

export type WrittenTemplate = {
  written: string[];
  modified: string[];
}

export type GeneratorOptions = {
  [key: string]: any;
};

export type PredefinedGeneratorOptions = {
  name: string;
  dir?: string;
  entryPoint: string;
};

export type Compiler = {
  run: (error: any) => void;
}

export type Response = {
  status: (code: number) => void;
  sendStatus: (code: number) => void;
  send: (value: string | Object | Buffer) => void;
  set: (header: { [key: string]: string }) => void;
  redirect: (code: number, location: string) => void;
  header: (header: string) => void;
  status: (code: number) => Response;
  json: (json: Object) => void;
}

export type Request = {
  url: string;
  hostname: string;
  headers: Object;
}

export type Entries = {
  [key: string]: {
    component: Function;
    routes: Function;
    reducers: Object;
    name?: string;
  }
}

export type EntriesConfig = {
  [key: string]: {
    component: string;
    routes: string;
    reducers: string;
    name?: string;
  }
}

export type RenderRequirements = {
  Component: Function;
  routes: Function;
  reducers: Object;
  name: string;
  key: string;
}

export type RenderOutput = {
  responseString: string;
  rootElement: Object;
}

export type GetCachedIfProd = (req: Request, cache?: Object) => string | null;
export type SetCacheIfProd = (req: Request, value: string, maxAge?: number, cache?: Object) => void;
export type CacheManager = {
  getCachedIfProd: GetCachedIfProd;
  setCacheIfProd: SetCacheIfProd;
}

export type MismatchedModules = {
  [key: string]: {
    required: string;
    project: string;
    type: string;
  }
}

export type ProjectPackage = {
  dependencies: {
    [key: string]: string;
  };
  devDependencies: {
    [key: string]: string;
  };
}

export type UpdateDepsPromptResults = {
  shouldFix: boolean;
  mismatchedModules: MismatchedModules;
}

export type Hook = Function | Function[];

export type Hooks = {
  preInitServer?: Function;
  postServerRun?: Hook;
  preRenderFromCache?: Hook;
  postRenderRequirements?: Hook;
  preRedirect?: Hook;
  postRenderProps?: Hook;
  postGetCurrentRoute?: Hook;
  postRender?: Hook;
  error?: Hook;
};

export type Plugin = {
  name: string;
  meta: {
    [key: string]: any;
  };
  body: Function | null;
  options: Object;
};

export type ConfigPlugin = {
  name: string;
  meta: {
    [key: string]: any;
  };
  preOverwrites: {
    sharedWebpackConfig?: (config: WebpackConfig) => WebpackConfig;
  };
  postOverwrites: {
    gluestickConfig?: (config: GSConfig) => void;
    clientWebpackConfig?: (config: WebpackConfig) => WebpackConfig;
    serverWebpackConfig?: (config: WebpackConfig) => WebpackConfig;
  };
};

export type RuntimePlugin = {
  name: string;
  meta: {
    [key: string]: any;
  };
  body: {
    rootWrapper?: (component: Object) => Object;
  }
};

export type ServerPlugin = {
  name: string;
  meta: {
    [key: string]: any;
  };
  renderMethod: Function;
  hooks: Hooks;
};

export type RenderMethod = (root: Object, styleTags: Object[]) =>
{ body: string; head: Object[], additionalScripts?: Object[] };
