Redux sends actions to the reducers through a dispatch method that is provided for you through the @connect decorator that GlueStick automatically sets up for you. Redux gives you the ability to bind your action creators to the dispatcher with its bindActionCreators method. GlueStick also sets most of this up for you so that you only need to pass your action creators in the place where the code says ```/** _INSERT_ACTION_CREATORS_ **/.``

Update your Todos container so that you can pass your bound addTodo action creator to the AddTodo component.
src/containers/Todos.js

```bash
import React, { Component, PropTypes } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import TodoList from "../components/TodoList";
// import our addTodo action creator
import { addTodo } from "../actions/todos";

@connect(
    (state) => ({todos: state.todos}),
    // bind our action creator to the dispatch method so we can pass it around
    // without worrying about how to dispatch the action to our Redux store
    (dispatch) => bindActionCreators({addTodo}, dispatch)
)
export default class Todos extends Component {
    static fetchData ({dispatch}) {}

    render () {
        // Pass the bound addTodo action creator to TodoList
        return (
            <TodoList todos={this.props.todos} addTodo={this.props.addTodo} />
        );
    }
}
```
## 
```bash
Now that TodoList has been given the addTodo method, you can continue to pass it to your AddTodo form. Edit the TodoList component like the following:
src/components/TodoList.js


import React, { Component, PropTypes } from "react";
import AddTodo from "./AddTodo";

export default class TodoList extends Component {
    render () {
        const todos = this.renderTodos();
        return (
            <div>
                <AddTodo addTodo={this.props.addTodo} />
                {todos}
            </div>
        );
    }

    renderTodos () {
        if (!this.props.todos) return;

        return this.props.todos.map((todo, index) => {
            return <div key={index}>{todo}</div>;
        });
    }
}
```
## 
```bash
The only line we changed was that we changed ```<AddToo />``` to ```<AddTodo addTodo={this.props.addTodo}`` />.

Now, you can finish the AddTodo component by using the addTodo method. Edit the file and replace your ```// @TODO… ```comment with ```this.props.addTodo(newItem)```;


import React, { Component, PropTypes } from "react";

export default class AddTodo extends Component {
    render () {
        return (
            <div>
                <form onSubmit={this.didSubmit}>
                    <input type="text" ref={(input) => this.input = input} />
                </form>
            </div>
        );
    }

    didSubmit = (e) => {
        e.preventDefault();
        const newItem = this.input.value;
        this.input.value = "";
        this.props.addTodo(newItem);
    }
}

```