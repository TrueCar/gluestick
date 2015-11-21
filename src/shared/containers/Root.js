import React, { Component } from "react";
import { Router } from "react-router";

export default class Root extends Component {
    render () {
        return (
            <div>
                <Router>
                    {this.props.routes}
                </Router>
            </div>
        );
    }
}

