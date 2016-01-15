import React, { Component } from "react";
import serialize from "serialize-javascript";

export default class Body extends Component {
  render () {
    const {
      initialState,
      config
    } = this.props;
    return (
      <div>
        <div id="main" dangerouslySetInnerHTML={{__html: this.props.html}} />
        <script type="text/javascript" dangerouslySetInnerHTML={{__html: `window.__INITIAL_STATE__=${serialize(initialState)};`}}></script>
        <script type="text/javascript" src={`${config.assetPath}/main-bundle.js`}></script>
      </div>
    );
  }
}

