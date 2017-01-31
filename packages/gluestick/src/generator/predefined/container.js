const createTemplate = module.parent.createTemplate;

const containerTemplate = createTemplate`
/* @flow */
import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Helmet from "react-helmet";

export class ${args => args.name} extends Component {
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
        <Helmet title="${args => args.name}"/>
        ${args => args.name}
      </div>
    );
  }
}

export default connect(
  (/* state */) => ({/** _INSERT_STATE_  **/}),
  (dispatch) => bindActionCreators({/** _INSERT_ACTION_CREATORS_ **/}, dispatch)
)(${args => args.name});
`;

const testTemplate = createTemplate`
/*global React*/
/*global describe it*/
/*global expect*/
import { ${args => args.name} } from "${args => args.path}";
import { shallow } from "enzyme";

describe("${args => args.path}", () => {
  it("renders without an issue", () => {
    const subject = <${args => args.name} />;
    const wrapper = shallow(subject);
    expect(wrapper).to.exist;
  });
});
`;

module.exports = exports = options => ({
  args: {
    name: options.name,
  },
  entries: [
    {
      path: 'src/containers',
      filename: options.name,
      template: containerTemplate,
    },
    {
      path: 'test/containers',
      filename: `${options.name}.test.js`,
      template: testTemplate,
      args: {
        path: `containers/${options.name}`,
      },
    },
  ],
});
