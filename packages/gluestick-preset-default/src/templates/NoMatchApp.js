/* @flow */
import type { CreateTemplate } from '../types';

module.exports.source = (createTemplate: CreateTemplate) => createTemplate`
/* @flow */

import React, { Component } from "react";
import Helmet from "react-helmet";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

export class NoMatchApp extends Component {
  /**
   * Called by ReactRouter before loading the container. Called prior to the
   * React life cycle so doesn't have access to component's props or state.
   *
   * @param {Object} store redux store object
   * @param {Object} renderProps render properties returned from ReactRouter
   * @param {Object} query location data
   * @param {Object} serverProps server specific properties
   * @param {Boolean} serverProps.isServer method running on server or not
   * @param {Request} [serverProps.request] express request if isServer
   *
   * @return {(Promise|undefined)} If this method returns a promise, the router
   * will wait for the promise to resolve before the container is loaded.
   */
  static gsBeforeRoute (/* {dispatch}, renderProps, query, serverProps */) {}

  render () {
    return (
      <div>
        <Helmet title="Not Found" />
        <h2>404 - Not Found</h2>
      </div>
    );
  }
}

export default connect(
  (/* state */) => ({/** _INSERT_STATE_  **/}),
  (dispatch) => bindActionCreators({/** _INSERT_ACTION_CREATORS_ **/}, dispatch)
)(NoMatchApp);
`;

module.exports.test = (createTemplate: CreateTemplate) => createTemplate`
/* @flow */

import React from "react";
import { shallow } from "enzyme";

import { NoMatchApp } from "../NoMatchApp";

describe("containers/NoMatchApp", () => {
  it("renders without an issue", () => {
    const subject = <NoMatchApp />;
    const wrapper = shallow(subject);
    expect(wrapper).toBeDefined();
  });
});
`;
