/* @flow */

import type { PredefinedGeneratorOptions } from '../../types';

const path = require('path');

const createTemplate = module.parent.createTemplate;

const reducerTemplate = createTemplate`
/* @flow */

const INITIAL_STATE = null;

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    default:
      return state;
  }
};
`;

const testTemplate = createTemplate`
/* @flow */

import reducer from "${args => args.path}";

describe("${args => args.path}", () => {
  it("returns the initial state", () => {
    const state = void 0;
    expect(
      reducer(state, {})
    ).toBeNull();
  });
});
`;

const getReducerExport = name => `export { default as ${name} } from "./${name}";\n`;

module.exports = (options: PredefinedGeneratorOptions) => {
  const rewrittenName = `${options.name[0].toLowerCase()}${options.name.slice(1)}`;
  const directoryPrefix = options.dir && options.dir !== '.' ? `${options.dir}/` : '';
  return {
    modify: {
      file: path.join('src', options.entryPoint, 'reducers', 'index'),
      modifier: (content: string) => {
        if (content) {
          const lines = content.split('\n');
          lines[lines.length - 1] = getReducerExport(`${directoryPrefix}${rewrittenName}`);
          return lines.join('\n');
        }
        return getReducerExport(`${directoryPrefix}${rewrittenName}`);
      },
    },
    entries: [
      {
        path: path.join('src', options.entryPoint, 'reducers'),
        filename: rewrittenName,
        template: reducerTemplate,
      },
      {
        path: path.join('src', options.entryPoint, 'reducers', '__tests__'),
        filename: `${rewrittenName}.test.js`,
        template: testTemplate,
        args: {
          path: path.join(options.entryPoint, 'reducers', directoryPrefix, rewrittenName),
        },
      },
    ],
  };
};
