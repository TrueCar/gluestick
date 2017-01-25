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
/*global describe it*/
/*global expect*/
import reducer from "${args => args.path}";

describe("${args => args.name}", () => {
  it("returns the initial state", () => {
    const state = void 0;
    expect(
      reducer(state, {})
    ).to.equal(null);
  });
});
`;

const getReducerExport = name => `export { default as ${name} } from "./${name}";\n`;

module.exports = exports = options => ({
  modify: {
    file: "src/reducers/index",
    modificator: content => {
      if (content) {
        const lines = content.split("\n");
        lines[lines.length - 1] = getReducerExport(options.name);
        return lines.join("\n");
      }
      return getReducerExport(options.name);
    }
  },
  entries: [
    {
      path: "src/reducers",
      filename: options.name,
      template: reducerTemplate
    },
    {
      path: "test/reducers",
      filename: `${options.name}.test.js`,
      template: testTemplate,
      args: {
        name: options.name,
        path: `../../src/reducers/${options.name}`
      }
    }
  ]
});
