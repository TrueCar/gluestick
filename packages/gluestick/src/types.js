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
  GSConfig?: GSConfig;
  webpackConfig?: WebpackConfig;
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
}

export type Request = {
  url: string;
  hostname: string;
}
