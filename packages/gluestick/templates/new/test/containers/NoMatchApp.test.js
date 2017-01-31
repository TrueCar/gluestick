import React from "react";
import { shallow } from "enzyme";

import { NoMatchApp } from "containers/NoMatchApp";

describe("containers/NoMatchApp", () => {
  it("renders without an issue", () => {
    const subject = <NoMatchApp />;
    const wrapper = shallow(subject);
    expect(wrapper).toBeDefined();
  });
});

