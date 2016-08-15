/*eslint-disable react/no-danger*/
import React, { Component, PropTypes} from "react";
import serialize from "serialize-javascript";

export default class Body extends Component {
  static propTypes = {
    config: PropTypes.object.isRequired,
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
      entryPoint,
      config
    } = this.props;

    return (
      <div>
        { this._renderMainContent() }
        <script type="text/javascript" dangerouslySetInnerHTML={{__html: `window.__INITIAL_STATE__=${serialize(initialState, {isJSON: true})};`}}></script>
        <script type="text/javascript" src={`${config.assetPath}/commons.bundle.js`}></script>
        <script type="text/javascript" src={`${config.assetPath}/vendor.bundle.js`}></script>
        <script type="text/javascript" src={`${config.assetPath}/${entryPoint}-app.bundle.js`}></script>
      </div>
    );
  }

  _renderMainContent () {
    return <div id="main" dangerouslySetInnerHTML={{__html: this.props.html}} />;
  }
}

