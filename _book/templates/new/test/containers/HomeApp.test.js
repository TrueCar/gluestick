import { HomeApp } from "containers/HomeApp";
import { shallow } from "enzyme";

describe("containers/HomeApp", () => {
  it("renders without an issue", () => {
    const subject = <HomeApp />;
    const wrapper = shallow(subject);
    expect(wrapper).to.exist;
  });
});

