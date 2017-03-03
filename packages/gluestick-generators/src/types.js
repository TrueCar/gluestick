/* @flow */

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
