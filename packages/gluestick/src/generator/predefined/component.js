/* @flow */

import type { PredefinedGeneratorOptions } from '../../types';

const path = require('path');

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
import React from "react";
import { shallow } from "enzyme";

import ${args => args.name} from "${args => args.path}";

describe("${args => args.path}", () => {
  it("renders without an issue", () => {
    const subject = <${args => args.name} />;
    const wrapper = shallow(subject);
    expect(wrapper).toBeDefined();
  });
});
`;

module.exports = (options: PredefinedGeneratorOptions) => {
  const rewrittenName = `${options.name[0].toUpperCase()}${options.name.slice(1)}`;
  const directoryPrefix = options.dir && options.dir !== '.' ? `${options.dir}/` : '';

  return {
    args: {
      name: rewrittenName,
    },
    entries: [
      {
        path: path.join('src', options.entryPoint, 'components'),
        filename: rewrittenName,
        template: options.functional ? functionalComponentTemplate : classComponentTemplate,
      },
      {
        path: path.join('src', options.entryPoint, 'components', '__tests__'),
        filename: `${rewrittenName}.test.js`,
        template: testTemplate,
        args: {
          path: path.join(options.entryPoint, 'components', directoryPrefix, rewrittenName),
        },
      },
    ],
  };
};
