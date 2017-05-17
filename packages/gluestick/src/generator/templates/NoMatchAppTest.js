/* @flow */
import type { CreateTemplate } from '../../types';

module.exports = (createTemplate: CreateTemplate) => createTemplate`
/* @flow */

import React from "react";
import { shallow } from "enzyme";

import { NoMatchApp } from "../NoMatchApp";

describe("containers/NoMatchApp", () => {
  it("renders without an issue", () => {
    const subject = <NoMatchApp />;
    const wrapper = shallow(subject);
    expect(wrapper).toBeDefined();
  });
});
`;
