/* @flow */

export type Context = {
 config: Config,
 logger: Logger,
};

export type Config = {
  projectConfig?: ProjectConfig;
  GSConfig?: GSConfig;
  webpackConfig?: WebpackConfig;
  plugins: Object[];
};

export type Logger = LoggerTypes & {
  level?: string
};

export type Question = {
  type: string,
  name: string,
  message: string,
}

export type LoggerTypes = {
  success: Function;
  info: Function;
  warn: Function;
  debug: Function;
  error: Function;
}

export type ProjectConfig = {

};

type WebpackConfigEntry = string | string[] | Object;

export type WebpackConfig = {
  [key: string]: WebpackConfigEntry,
};

export type GSConfig = {

};
