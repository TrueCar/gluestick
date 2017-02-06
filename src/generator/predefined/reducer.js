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

module.exports = exports = options => {
  const rewrittenName = `${options.name[0].toLowerCase()}${options.name.slice(1)}`;
  return {
    modify: {
      file: "src/reducers/index",
      modifier: content => {
        if (content) {
          const lines = content.split("\n");
          lines[lines.length - 1] = getReducerExport(rewrittenName);
          return lines.join("\n");
        }
        return getReducerExport(rewrittenName);
      }
    },
    entries: [
      {
        path: "src/reducers",
        filename: rewrittenName,
        template: reducerTemplate
      },
      {
        path: "test/reducers",
        filename: `${rewrittenName}.test.js`,
        template: testTemplate,
        args: {
          path: `reducers/${rewrittenName}`
        }
      }
    ]
  };
};
