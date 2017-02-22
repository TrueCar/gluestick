/* @flow */
import type { CreateTemplate } from '../../types';

module.exports = (createTemplate: CreateTemplate) => createTemplate`
/* @flow */

import React from "react";
import { shallow } from "enzyme";

import Home from "../Home";

describe("components/Home", () => {
  it("renders without an issue", () => {
    const subject = <Home />;
    const wrapper = shallow(subject);
    expect(wrapper).toBeDefined();
  });
});
`;
