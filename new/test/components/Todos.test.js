import Todos from "components/Todos";

describe("components/Todos", () => {
    it("should render without issues", () => {
        const subject = <Todos todos={["one", "two"]} />;
        const renderedSubject = TestUtils.renderIntoDocument(subject);
        expect(renderedSubject).to.not.equal(undefined);
    });
});

