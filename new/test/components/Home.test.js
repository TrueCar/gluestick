import Home from "components/Home";
import { shallow, mount, render } from 'enzyme';

describe("components/Home", () => {
    it("should render without an issue", () => {
        const subject = <Home />;
        const renderedSubject = <div>Home</div>;
        expect(mount(subject).contains(renderedSubject)).to.equal(true);
    });
});

