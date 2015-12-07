import Home from "components/Home";

describe("components/Home", () => {
    it("should render without an issue", () => {
        const subject = <Home />;
        const renderedSubject = TestUtils.renderIntoDocument(subject);
        expect(renderedSubject).to.not.equal(undefined);
    });
});

