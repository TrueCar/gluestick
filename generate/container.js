import React, { Component, PropTypes } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

@connect(
    (state) => ({/** _INSERT_STATE_  **/}),
    (dispatch) => bindActionCreators({/** _INSERT_ACTION_CREATORS_ **/}, dispatch)
)
export default class __$NAME__ extends Component {
    static fetchData ({dispatch}) {}

    render () {
        return (
            <div>__$NAME__</div>
        );
    }
}

