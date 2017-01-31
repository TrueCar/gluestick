/* @flow */

export type Context = {
 config: {
   projectConfig?: ProjectConfig;
   GSConfig?: GSConfig;
   webpackConfig?: WebpackConfig;
   plugins: Array<Object>;
 },
 logger: {
   success: Function; // Function: (...args: string) => void
   info: Function; // Function: (...args: string) => void
   warn: Function; // Function: (...args: string) => void
   debug: Function; // Function: (...args: string) => void
   error: Function; // Function: (...args: string) => void
 },
};

export type ProjectConfig = {

};

type WebpackConfigEntry = string | string[] | Object;

export type WebpackConfig = {
  [key: string]: WebpackConfigEntry,
};

export type GSConfig = {

};
