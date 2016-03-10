import __$NAME__ from "components/__$NAME__";
import { shallow } from "enzyme";

describe("components/__$NAME__", () => {
  it("renders without an issue", () => {
    const subject = <__$NAME__ />;
    const wrapper = shallow(subject);
    expect(wrapper).to.exist;
  });
});

