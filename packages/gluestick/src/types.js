/* @flow */

export type ProjectConfig = {
  [key: string]: any;
};

export type GSConfig = {
  protocol: string,
  host: string,
  ports: {
    client: number,
    server: number,
  },
  assetsPath: string,
  proxyLogLevel: string,
  debugWatchDirectories: string[],
  [key: string]: any,
};

type WebpackConfigEntry = string | Object | any[];

export type WebpackConfig = {
  [key: string]: WebpackConfigEntry,
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
  level?: string
};

export type LoggerTypes = {
  success: Function;
  info: Function;
  warn: Function;
  debug: Function;
  error: Function;
}

export type Context = {
 config: Config,
 logger: Logger,
};

export type UniversalWebpackConfigurator = (options: any) => WebpackConfig;

export type Question = {
  type: string,
  name: string,
  message: string,
}
