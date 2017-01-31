import React from "react";
import { shallow } from "enzyme";

import { HomeApp } from "containers/HomeApp";

describe("containers/HomeApp", () => {
  it("renders without an issue", () => {
    const subject = <HomeApp />;
    const wrapper = shallow(subject);
    expect(wrapper).toBeDefined();
  });
});

