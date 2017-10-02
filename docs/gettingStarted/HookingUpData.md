# Hooking up your data

Now that you have a reducer that is responsible for handling the todos part of your application-state, you can expose that state to the rest of your application through the container.
In order to do so, update your todo container to the following:

src/containers/Todos.js

```bash
import React, { Component, PropTypes } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import TodoList from "../components/TodoList";

@connect(
    // Expose the part of the state that our todos reducer is reponsible for to our container
    (state) => ({todos: state.todos}),
    (dispatch) => bindActionCreators({/** _INSERT_ACTION_CREATORS_ **/}, dispatch)
)
export default class Todos extends Component {
    static fetchData ({dispatch}) {}

    render () {
        // Use our TodoList component and pass our todos to it
        return (
            <TodoList todos={this.props.todos} />
        );
    }
}

```

Next, you’ll need to get your TodoList component showing the items on your todo list. Update your TodoList component

```bash
import React, { Component, PropTypes } from "react";

export default class TodoList extends Component {
    render () {
        const todos = this.renderTodos();
        return (
            <div>
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


The renderTodos method will return an array of elements containing the todo list text. You’ll assign this array to a variable and expose it in your render function.

You will need to refresh the browser for this update to work because our reducer was original set up with an initial state that wasn’t an array. Hot module loading will not replace an existing state.

Once you refresh the browser, you should now see both of your todo list items on the page.
