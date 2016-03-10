import __$NAME__ from "components/__$NAME__";

describe("components/__$NAME__", () => {
  it("renders without an issue", () => {
    const subject = <__$NAME__ />;
    const renderedSubject = TestUtils.renderIntoDocument(subject);
    expect(renderedSubject).to.exist;
  });
});
