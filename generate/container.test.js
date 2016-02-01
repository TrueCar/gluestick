import { __$NAME__ } from "containers/__$NAME__";

describe("containers/__$NAME__", () => {
  it("renders without an issue", () => {
    const subject = <__$NAME__ />;
    const renderedSubject = TestUtils.renderIntoDocument(subject);
    expect(renderedSubject).to.not.equal(undefined);
  });
});
