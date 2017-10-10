# Generate a component for adding todos

Now that you set up the rendering of the todo list items, it is time to allow users to add new items to the list. Generate a new component named AddTodo.

```gluestick generate component AddTodo```


Once that is created, edit your TodoList component to include it above your list.
src/components/TodoList.js

```bash
import React, { Component, PropTypes } from "react";

// Import our AddTodo component
import AddTodo from "./AddTodo";

export default class TodoList extends Component {
    render () {
        const todos = this.renderTodos();
        // Update our render method to include our AddTodo component
        return (
            <div>
                <AddTodo />
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

As soon as you save this file, you will see AddTodo show up above your todo list items. You’ll want that to be an input form, so edit the the AddTodo component.
src/components/AddTodo.js

```bash

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
        // @TODO: send our new item to redux
    }
}
```


Your ```AddTodo component``` will render a form that, when submitted, will call your didSubmit method. You will call ```e.preventDefault()``` to prevent the form from doing a traditional form submission that would leave the page. You’ll make your input element available to your methods using the ref property.

See React docs for more information on refs (https://facebook.github.io/react/docs/more-about-refs.html).

 When didSubmit is called, you will capture the value from the input and then clear the form. The next step will be to update your application-state to include this new todo item. Before you can do that, you need to dive into action creators.
