import { __$NAME__ } from "containers/__$NAME__";
import { shallow } from "enzyme";

describe("containers/__$NAME__", () => {
  it("renders without an issue", () => {
    const subject = <__$NAME__ />;
    const wrapper = shallow(subject);
    expect(wrapper).to.exist;
  });
});

