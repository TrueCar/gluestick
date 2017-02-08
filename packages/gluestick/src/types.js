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

export type Logger = {
  [key: LoggerTypes]: Function; // (...args: string[]) => void;
  level?: string
};

export type Question = {
  type: string,
  name: string,
  message: string,
}

export type LoggerTypes = 'success'
  | 'info'
  | 'warn'
  | 'debug'
  | 'error';

export type ProjectConfig = {

};

type WebpackConfigEntry = string | string[] | Object;

export type WebpackConfig = {
  [key: string]: WebpackConfigEntry,
};

export type GSConfig = {

};

export type CreateTemplate = (
  strings: Array<string>,
  interpolations: Array<*>
) => (args: Object) => string;

export type Generator = {
  name: string,
  config: any,
}

export type WrittenTemplate = {
  name: string,
  config: any,
}
