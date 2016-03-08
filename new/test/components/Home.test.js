import Home from "components/Home";
import { shallow, mount, render } from 'enzyme';

describe("components/Home", () => {
    it("should render without an issue", () => {
        const subject = <Home />;
        expect(shallow(subject)).not.to.equal(undefined);
    });
});

