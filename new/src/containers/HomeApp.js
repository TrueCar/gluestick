import React, { Component, PropTypes } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { addTodo, getTodos } from "../actions/todos";

import Todos from "../components/Todos";

@connect(
    (state) => ({todos: state.todos}),
    (dispatch) => bindActionCreators({addTodo}, dispatch)
)
export default class HomeApp extends Component {
    static fetchData ({dispatch}) {
        return dispatch(getTodos());
    }

    render () {
        const {
            todos,
            addTodo
        } = this.props;

        return (
            <Todos todos={todos} addTodo={addTodo} />
        );
    }
}

