/* @flow */

import type { PredefinedGeneratorOptions, GeneratorUtils } from '../types';

const path = require('path');

const getClassComponentTemplate = createTemplate => createTemplate`
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

const getFunctionalComponentTemplate = createTemplate => createTemplate`
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

const getTestTemplate = createTemplate => createTemplate`
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

module.exports = (
  { convertToPascalCase, createTemplate }: GeneratorUtils,
) => (options: PredefinedGeneratorOptions) => {
  const rewrittenName = convertToPascalCase(options.name);
  const directoryPrefix = options.dir && options.dir !== '.' ? `${options.dir}/` : '';

  return {
    args: {
      name: rewrittenName,
    },
    entries: [
      {
        path: path.join('src', options.entryPoint, 'components', directoryPrefix),
        filename: rewrittenName,
        template: options.functional
          ? getFunctionalComponentTemplate(createTemplate)
          : getClassComponentTemplate(createTemplate),
      },
      {
        path: path.join('src', options.entryPoint, 'components', directoryPrefix, '__tests__'),
        filename: `${rewrittenName}.test.js`,
        template: getTestTemplate(createTemplate),
        args: {
          path: path.join(options.entryPoint, 'components', directoryPrefix, rewrittenName),
        },
      },
    ],
  };
};
