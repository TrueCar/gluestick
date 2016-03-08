import Home from "components/Home";
import { shallow } from "enzyme";

describe("components/Home", () => {
  it("should render without an issue", () => {
    const subject = <Home />;
    expect(shallow(subject)).to.exist;
  });
});

