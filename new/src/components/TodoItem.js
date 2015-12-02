import React, { Component, PropTypes } from "react";

export default class TodoItem extends Component {
    render () {
        return (
            <div>{this.props.children}</div>
        );
    }
}

