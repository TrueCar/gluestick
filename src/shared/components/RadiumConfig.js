import React, { Component } from "react";
import Radium from "radium";

@Radium
export default class RadiumConfig extends Component {
  render () {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}

