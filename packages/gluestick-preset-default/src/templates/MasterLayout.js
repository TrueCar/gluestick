/* @flow */
import type { CreateTemplate } from '../types';

module.exports.source = (createTemplate: CreateTemplate) => createTemplate`
/* @flow */

import React, { Component, PropTypes } from "react";
import Helmet from "react-helmet";
import config from "config/application";

export default class MasterLayout extends Component {
  static propTypes = {
    children: PropTypes.any
  };

  render () {
    return (
      <div>
        <Helmet {...config.head}/>
        {this.props.children}
      </div>
    );
  }
}
`;

module.exports.test = (createTemplate: CreateTemplate) => createTemplate`
/* @flow */

import React from "react";
import { shallow } from "enzyme";

import MasterLayout from "../MasterLayout";

describe("components/MasterLayout", () => {
  it("renders without an issue", () => {
    const subject = <MasterLayout />;
    const wrapper = shallow(subject);
    expect(wrapper).toBeDefined();
  });
});
`;
