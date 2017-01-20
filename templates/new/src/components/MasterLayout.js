/* @flow */
import React, { Component } from "react";
import Helmet from "react-helmet";
import config from "../config/application";

export default class MasterLayout extends Component {
  props: {
    children: ?any
  }

  render () {
    return (
      <div>
        <Helmet {...config.head}/>
        {this.props.children}
      </div>
    );
  }
}

