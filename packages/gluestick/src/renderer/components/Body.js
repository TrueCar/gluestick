/* eslint-disable react/no-danger*/
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import serialize from 'serialize-javascript';

export default class Body extends Component {
  static propTypes = {
    html: PropTypes.string.isRequired,
    isEmail: PropTypes.bool.isRequired,
    initialState: PropTypes.any.isRequired,
    envVariables: PropTypes.array.isRequired,
    ScriptTags: PropTypes.array.isRequired,

  };

  render() {
    const { isEmail } = this.props;

    if (isEmail) {
      return this._renderWithoutScriptTags();
    }
    return this._renderWithScriptTags();
  }

  _renderWithoutScriptTags() {
    return (
      <div>
        {this._renderMainContent()}
      </div>
    );
  }

  _renderWithScriptTags() {
    const windowVariables = this._getGlobalVariables();
    const { ScriptTags, CssHash } = this.props;
    return (
      <div>
        <div>
          {this._renderMainContent()}
        </div>
        <CssHash />
        <ScriptTags />
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{ __html: windowVariables }}
        />
      </div>
    );
  }

  _renderMainContent() {
    return (
      <div id="main">
        <div dangerouslySetInnerHTML={{ __html: this.props.html }} />
      </div>
    );
  }

  _getGlobalVariables() {
    const { initialState, envVariables } = this.props;

    const envVarsValues = {};
    envVariables.forEach(name => {
      const value = process.env[name];
      if (typeof value !== 'undefined') {
        envVarsValues[name] = value;
      }
    });

    const state = `window.__INITIAL_STATE__=${serialize(initialState, {
      isJSON: true,
    })};`;
    const gsEnvs = `window.__GS_ENV_VARS__=${serialize(envVarsValues, {
      isJSON: true,
    })};`;
    return state.concat(gsEnvs);
  }
}
