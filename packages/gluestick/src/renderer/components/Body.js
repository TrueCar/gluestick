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
    scriptTags: PropTypes.string.isRequired,
  };

  render() {
    const { isEmail, scriptTags, CssHash } = this.props;
    const windowVariables = this._getGlobalVariables();

    return (
      <React.Fragment>
        <CssHash />
        {!isEmail &&
          <React.Fragment>
            <script
              type="text/javascript"
              dangerouslySetInnerHTML={{ __html: windowVariables }}
            />
            <div dangerouslySetInnerHTML={{ __html: scriptTags }} />
            <div
              id="main"
              dangerouslySetInnerHTML={{ __html: this.props.html }}
            />
          </React.Fragment>}
      </React.Fragment>
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
