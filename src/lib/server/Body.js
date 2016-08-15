/*eslint-disable react/no-danger*/
import React, { Component, PropTypes} from "react";
import serialize from "serialize-javascript";

import getAssetPathForFile from "../getAssetPathForFile";

export default class Body extends Component {
  static propTypes = {
    html: PropTypes.string.isRequired,
    isEmail: PropTypes.bool.isRequired,
    entryPoint: PropTypes.string.isRequired,
    initialState: PropTypes.any.isRequired
  };

  render () {
    const { isEmail } = this.props;

    if (isEmail) { return this._renderWithoutScriptTags(); }
    return this._renderWithScriptTags();
  }

  _renderWithoutScriptTags () {
    return (
      <div>
        { this._renderMainContent() }
      </div>
    );
  }

  _renderWithScriptTags () {
    const {
      initialState,
      entryPoint
    } = this.props;

    return (
      <div>
        { this._renderMainContent() }
        <script type="text/javascript" dangerouslySetInnerHTML={{__html: `window.__INITIAL_STATE__=${serialize(initialState, {isJSON: true})};`}}></script>
        <script type="text/javascript" src={getAssetPathForFile("commons", "javascript")}></script>
        <script type="text/javascript" src={getAssetPathForFile("vendor", "javascript")}></script>
        <script type="text/javascript" src={getAssetPathForFile(entryPoint)}></script>
      </div>
    );
  }

  _renderMainContent () {
    return <div id="main" dangerouslySetInnerHTML={{__html: this.props.html}} />;
  }
}

