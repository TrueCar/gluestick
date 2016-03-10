/* @flow */
import React, { Component, PropTypes } from "react";

export default class MasterLayout extends Component {
  static propTypes = {
    children: PropTypes.any
  };

  render () {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}

