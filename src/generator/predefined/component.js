const createTemplate = module.parent.createTemplate;

const classComponentTemplate = createTemplate`
/* @flow */
import React, { Component } from "react";

export default class ${args => args.name} extends Component {
  render () {
    return (
      <div>
        ${args => args.name}
      </div>
    );
  }
}
`;

const functionalComponentTemplate = createTemplate`
/* @flow */
import React from "react";

export default function ${args => args.name} () {
  return (
    <div>
       ${args => args.name}
    </div>
  );
}
`;

const testTemplate = createTemplate`
/*global React*/
/*global describe it*/
/*global expect*/
import ${args => args.name} from "${args => args.path}";
import { shallow } from "enzyme";

describe("${args => args.name}", () => {
  it("renders without an issue", () => {
    const subject = <${args => args.name} />;
    const wrapper = shallow(subject);
    expect(wrapper).to.exist;
  });
});
`;

module.exports = exports = options => ({
  args: {
    name: options.name
  },
  entries: [
    {
      path: "src/components",
      filename: options.name,
      template: options.functional ? functionalComponentTemplate : classComponentTemplate,
    },
    {
      path: "test/components",
      filename: `${options.name}.test.js`,
      template: testTemplate,
      args: {
        path: `../src/components/${options.name}`
      }
    }
  ]
});
