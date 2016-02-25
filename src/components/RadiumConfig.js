import React, { Component } from "react";
import Radium, { StyleRoot } from "radium";

@Radium
export default class RadiumConfig extends Component {
  render () {
    return (
      <StyleRoot>
        {this.props.children}
      </StyleRoot>
    );
  }
}

