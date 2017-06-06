/* @flow */

import type { PredefinedGeneratorOptions, GeneratorUtils } from '../types';

const path = require('path');

const getReducerTemplate = createTemplate => createTemplate`
/* @flow */

type State = {
  // State handle by your reducer goes here
}

const INITIAL_STATE: State = {};

export default (state: State = INITIAL_STATE, action: { type: string, payload?: any }) => {
  switch (action.type) {
    default:
      return state;
  }
};
`;

const getTestTemplate = createTemplate => createTemplate`
/* @flow */

import reducer from "${args => args.path}";

describe("${args => args.path}", () => {
  it("returns the initial state", () => {
    const state = {};
    expect(
      reducer({}, {
        type: "_TEST_ACTION"
      })
    ).toEqual(state);
  });
});
`;

const getReducerImport = (name, dir) => `import ${name} from "./${dir}";`;

module.exports = (
  { convertToCamelCase, convertToCamelCaseWithPrefix, createTemplate }: GeneratorUtils,
) => (options: PredefinedGeneratorOptions) => {
  const rewrittenName = convertToCamelCase(options.name);
  const directoryPrefix = options.dir && options.dir !== '.' ? `${options.dir}/` : '';
  return {
    modify: {
      file: path.join('src', options.entryPoint, 'reducers', 'index'),
      modifier: (content: string) => {
        const lines = content
          ? content.split('\n')
          : ['/* @flow */', '', 'export default {', '};', '']; // Defaults if file does not exist
        // If reducer was generated in nested directory, add this directory to name
        // and make it camelCase
        const name = directoryPrefix
          ? convertToCamelCaseWithPrefix(directoryPrefix.replace('/', ''), rewrittenName)
          : rewrittenName;
        // Add import statement
        lines.splice(1, 0, getReducerImport(name, `${directoryPrefix}${rewrittenName}`));
        const exportStartIndex = lines.indexOf('export default {');
        // Add reducer to object
        lines.splice(exportStartIndex + 1, 0, `  ${name},`);
        return lines.join('\n');
      },
    },
    entries: [
      {
        path: path.join('src', options.entryPoint, 'reducers', directoryPrefix),
        filename: rewrittenName,
        template: getReducerTemplate(createTemplate),
      },
      {
        path: path.join('src', options.entryPoint, 'reducers', directoryPrefix, '__tests__'),
        filename: `${rewrittenName}.test.js`,
        template: getTestTemplate(createTemplate),
        args: {
          path: path.join(options.entryPoint, 'reducers', directoryPrefix, rewrittenName),
        },
      },
    ],
  };
};
