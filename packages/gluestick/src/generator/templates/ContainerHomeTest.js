/* @flow */

import type { CreateTemplate } from '../../types';

module.exports = (createTemplate: CreateTemplate) => createTemplate`
/* @flow */

import React from "react";
import { shallow } from "enzyme";

import { HomeApp } from "../HomeApp";

describe("containers/HomeApp", () => {
  it("renders without an issue", () => {
    const subject = <HomeApp />;
    const wrapper = shallow(subject);
    expect(wrapper).toBeDefined();
  });
});
`;
