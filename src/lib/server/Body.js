/*eslint-disable react/no-danger*/
import React, { Component, PropTypes} from "react";
import serialize from "serialize-javascript";

export default class Body extends Component {
  static propTypes = {
    html: PropTypes.string,
    isEmail: PropTypes.bool.isRequired,
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
      <div>
        {this._renderMainContent()}
      </div>
    );
  }

  _renderWithScriptTags () {
    const windowVariables = this._getGlobalVariables();

    return (
      <div>
        <div>
          {this._renderMainContent()}
        </div>
        <script type="text/javascript" dangerouslySetInnerHTML={{__html: windowVariables}}></script>
      </div>
    );
  }


  _renderMainContent () {
    return (
      <div id="main">
        <div dangerouslySetInnerHTML={{__html: this.props.html}} />
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

