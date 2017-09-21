# Prefetching data with fetchData

Earlier, we mentioned the static fetchData method. React Router allows you to call a method before rendering a component. In this case, all of the containers have the opportunity to let the server and client know if you need to fetch data before showing the component.
To use this method, create an action creator using the Promise middleware and return the result of dispatching that action.
Example:
```bash
import React, { Component, PropTypes } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import TodoList from "../components/TodoList";
import { getTodos, addTodo } from "../actions/todos";

@connect(
    (state) => ({todos: state.todos}),
    (dispatch) => bindActionCreators({addTodo}, dispatch)
)
export default class Todos extends Component {
    static fetchData ({dispatch}) {
        // It is important you `return` the result and that you pass the result of
        // `getTodos()`, not the the function itself. Lastly make sure getTodos()
        // returns an action using the promise middleware so the the dispatch method
        // returns a promise.
        return dispatch(getTodos());
    }

    render () {
        return (
            <TodoList todos={this.props.todos} addTodo={this.props.addTodo} />
        );
    }
}
```
