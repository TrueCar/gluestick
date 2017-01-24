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

const newReducersIndexFactory = (name, path) => `
import { combineReducers } from "redux";
import ${name} from "${path}";

export default combineReducers({
  ${name}
});
`;

module.exports = exports = options => ({
  modify: {
    file: "src/reducers/index",
    modificator: content => {
      if (content) {
        const lines = content.split("\n");
        let lastImportIndex = -1;
        lines.forEach((line, index) => {
          if (line.startsWith("import")) {
            lastImportIndex = index;
          }
        });
        lines[lastImportIndex] += "\n" + `import ${options.name} from "./${options.name}";`;
        lines[lines.length - 3] += ",\n" + `  ${options.name}`;
        return lines.join("\n");
      }
      return newReducersIndexFactory(options.name, `./${options.name}`);
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
