/*global React*/
/*global describe it*/
/*global expect*/
import __$NAME__ from "__$PATH__";
import { shallow } from "enzyme";

describe("__$PATH__", () => {
  it("renders without an issue", () => {
    const subject = <__$NAME__ />;
    const wrapper = shallow(subject);
    expect(wrapper).to.exist;
  });
});

