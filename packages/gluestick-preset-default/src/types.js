export type CreateTemplate = (
  interpolations: Array<*>,
  strings: Array<string>,
) => (args: Object) => string;

export type GeneratorOptions = {
  [key: string]: any;
};

export type GeneratorUtils = {
  convertToCamelCase: Function;
  convertToKebabCase: Function;
  createTemplate: Function;
};

export type PredefinedGeneratorOptions = {
  name: string;
  dir?: string;
  entryPoint: string;
};
