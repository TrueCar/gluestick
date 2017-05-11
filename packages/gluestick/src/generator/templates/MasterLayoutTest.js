/* @flow */
import type { CreateTemplate } from '../../src/types';

module.exports = (createTemplate: CreateTemplate) => createTemplate`
/* @flow */

import React from "react";
import { shallow } from "enzyme";

import MasterLayout from "../MasterLayout";

describe("components/MasterLayout", () => {
  it("renders without an issue", () => {
    const subject = <MasterLayout />;
    const wrapper = shallow(subject);
    expect(wrapper).toBeDefined();
  });
});
`;
