/* @flow */
import type { CreateTemplate } from '../../types';

module.exports = (createTemplate: CreateTemplate) => {
  const template = createTemplate`
   import MasterLayout from "components/MasterLayout";
   import { shallow } from "enzyme";

   describe("components/MasterLayout", () => {
      it("renders without an issue", () => {
       const subject = <MasterLayout />;
       const wrapper = shallow(subject);
       expect(wrapper).to.exist;
     });
   });
  `;
  return template;
};
