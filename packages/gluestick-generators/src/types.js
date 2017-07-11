/* @flow */

export type Logger = BaseLogger & {
  level?: string,
};

export type BaseLogger = {
  success: Function,
  info: Function,
  warn: Function,
  debug: Function,
  error: Function,
};

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
