/*eslint-disable react/no-danger*/
import React, { Component, PropTypes} from "react";
import serialize from "serialize-javascript";

import getAssetPathForFile from "../getAssetPathForFile";

export default class Body extends Component {
  static propTypes = {
    main: PropTypes.string.object,
    isEmail: PropTypes.bool.isRequired,
    entryPoint: PropTypes.string.isRequired,
    initialState: PropTypes.any.isRequired,
    envVariables: PropTypes.array.isRequired
  };

  render () {
    const { isEmail } = this.props;

    if (isEmail) { return this._renderWithoutScriptTags(); }
    return this._renderWithScriptTags();
  }

  _renderWithoutScriptTags () {
    return (
      <div id="main">
        { this.props.main }
      </div>
    );
  }

  _renderWithScriptTags () {
    const {
      entryPoint
    } = this.props;

    const windowVariables = this._getGlobalVariables();

    return (
      <div>
        <div id="main">
          { this.props.main }
        </div>
        <script type="text/javascript" dangerouslySetInnerHTML={{__html: windowVariables}}></script>
        <script type="text/javascript" src={getAssetPathForFile("commons", "javascript")}></script>
        <script type="text/javascript" src={getAssetPathForFile("vendor", "javascript")}></script>
        <script type="text/javascript" src={getAssetPathForFile(entryPoint, "javascript")} async></script>
      </div>
    );
  }

  _getGlobalVariables () {
    const { initialState, envVariables } = this.props;

    const envVarsValues = {};
    envVariables.map(name => {
      const value = process.env[name];
      if (typeof(value) !== "undefined") {
        envVarsValues[name] = value;
      }
    });

    const state = `window.__INITIAL_STATE__=${serialize(initialState, {isJSON: true})};`;
    const gsEnvs = `window.__GS_ENV_VARS__=${serialize(envVarsValues, {isJSON: true})};`;
    return state.concat(gsEnvs);
  }
}

