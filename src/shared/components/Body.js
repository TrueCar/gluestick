import React, { Component } from "react";

export default class Body extends Component {
    render () {
        return (
            <div>
                <div id="main" dangerouslySetInnerHTML={{__html: this.props.html}} />
                <script type="text/javascript" src="http://localhost:8888/main-bundle.js"></script>
            </div>
        );
    }
}

