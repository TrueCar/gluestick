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
  assetsPath: string;
  sharedPath: string;
  appsPath: string;
  configPath: string;
  entryWrapperPath: string;
  clientEntryInitPath: string;
  serverEntriesPath: string;
  entriesPath: string;
  webpackChunks: string;
  proxyLogLevel: string;
  debugWatchDirectories: string[];
  defaultErrorTemplatePath: string;
  customErrorTemplatePath: string;
  [key: string]: any;
};

export type WebpackConfigEntry = string | Object | any[];

export type WebpackConfig = {
  [key: string]: WebpackConfigEntry;
};

export type Plugin = {
  name: string;
  body: any;
};

export type Config = {
  projectConfig?: ProjectConfig;
  GSConfig: GSConfig;
  webpackConfig: WebpackConfig;
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
  name: string;
  config: any;
}

export type GeneratorOptions = {
  [key: string]: ?string;
}

export type Response = {
  status: (code: number) => void;
  sendStatus: (code: number) => void;
  send: (value: string | Object | Buffer) => void;
  set: (header: { [key: string]: string }) => void;
  redirect: (code: number, location: string) => void;
}

export type Request = {
  url: string;
  hostname: string;
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
