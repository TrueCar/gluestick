/* @flow */
import type { CreateTemplate } from '../../types';

module.exports = (createTemplate: CreateTemplate) => {
  const template = createTemplate`
   import { NoMatchApp } from "containers/NoMatchApp";
   import { shallow } from "enzyme";

   describe("containers/NoMatchApp", () => {
    it("renders without an issue", () => {
      const subject = <NoMatchApp />;
      const wrapper = shallow(subject);
      expect(wrapper).to.exist;
    });
  });
  `;
  return template;
};
