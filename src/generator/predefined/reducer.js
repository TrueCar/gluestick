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

module.exports = exports = {
  entries: [
    options => ({
      path: "src/reducers",
      filename: options.name,
      template: reducerTemplate
    }),
    options => ({
      path: "test/reducers",
      filename: `${options.name}.test`,
      template: testTemplate,
      args: {
        name: options.name,
        path: `../../src/reducers/${options.name}`
      }
    })
  ]
};
