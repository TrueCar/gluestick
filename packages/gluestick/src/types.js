/* @flow */

export type Context = {
 config: {
   projectConfig?: ProjectConfig;
   GSConfig?: GSConfig;
   webpackConfig?: WebpackConfig;
   plugins: Array<Object>;
 },
 logger: {
   success: (type: LoggerTypes) => Function; // (...args: string[]) => void;
   info: (type: LoggerTypes) => Function; // (...args: string[]) => void;
   warn: (type: LoggerTypes) => Function; // (...args: string[]) => void;
   debug: (type: LoggerTypes) => Function; // (...args: string[]) => void;
   error: (type: LoggerTypes) => Function; // (...args: string[]) => void;
 },
};

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
