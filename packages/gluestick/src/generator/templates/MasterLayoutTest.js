/* @flow */
import type { CreateTemplate } from '../../types';

module.exports = (createTemplate: CreateTemplate) => {
  const template = createTemplate`
import React from "react";
import { shallow } from "enzyme";

import MasterLayout from "components/MasterLayout";

describe("components/MasterLayout", () => {
  it("renders without an issue", () => {
    const subject = <MasterLayout />;
    const wrapper = shallow(subject);
    expect(wrapper).toBeDefined();
  });
});
`;
  return template;
};
