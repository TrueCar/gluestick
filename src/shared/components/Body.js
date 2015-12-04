import React, { Component } from "react";
import serialize from "serialize-javascript";

export default class Body extends Component {
    render () {
        const {
            initialState
        } = this.props;
        return (
            <div>
                <div id="main" dangerouslySetInnerHTML={{__html: this.props.html}} />
                <script type="text/javascript" dangerouslySetInnerHTML={{__html: `window.__INITIAL_STATE__=${serialize(initialState)};`}}></script>
                <script type="text/javascript" src="http://localhost:8888/main-bundle.js"></script>
            </div>
        );
    }
}

