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

describe("${args => args.path}", () => {
  it("renders without an issue", () => {
    const subject = <${args => args.name} />;
    const wrapper = shallow(subject);
    expect(wrapper).to.exist;
  });
});
`;

module.exports = (options) => {
  const rewrittenName = `${options.name[0].toUpperCase()}${options.name.slice(1)}`;
  return {
    args: {
      name: rewrittenName,
    },
    entries: [
      {
        path: 'src/components',
        filename: rewrittenName,
        template: options.functional ? functionalComponentTemplate : classComponentTemplate,
      },
      {
        path: 'test/components',
        filename: `${rewrittenName}.test.js`,
        template: testTemplate,
        args: {
          path: `components/${rewrittenName}`,
        },
      },
    ],
  };
};
