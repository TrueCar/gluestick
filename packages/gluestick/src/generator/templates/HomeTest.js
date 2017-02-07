/* @flow */
import type { CreateTemplate } from '../../types';

module.exports = (createTemplate: CreateTemplate) => {
  const template = createTemplate`
    import Home from "components/Home";
    import { shallow } from "enzyme";

    describe("components/Home", () => {
      it("renders without an issue", () => {
        const subject = <Home />;
        const wrapper = shallow(subject);
        expect(wrapper).to.exist;
      });
    });
  `;
  return template;
};
