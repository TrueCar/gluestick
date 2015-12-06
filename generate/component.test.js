import __$NAME__ from "components/__$NAME__";

describe("components/__$NAME__", () => {
    it("should render without an issue", () => {
        const subject = <__$NAME__ />;
        const renderedSubject = TestUtils.renderIntoDocument(subject);
        expect(renderedSubject).to.not.equal(undefined);
    });
});

