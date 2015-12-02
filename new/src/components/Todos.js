import React, { Component } from "react";
import Radium from "radium";

import TodoItem from "./TodoItem";
import AddTodoForm from "./AddTodoForm";

@Radium
export default class Todos extends Component {
    render () {
        const {
            addTodo
        } = this.props;
        const todoItems = this._renderTodoItems();
        return (
            <div>
                <h1 style={styles.header}>Todos</h1> 
                <AddTodoForm addTodo={addTodo} />
                {todoItems}
            </div>
        );
    }

    _renderTodoItems = () => {
        return this.props.todos.map((todo, i) => {
            return <TodoItem key={i}>{todo}</TodoItem>;
        });
    }
}

const styles = {
    header: {
        fontFamily: "sans-serif",
        ":hover": {
            opacity: 0.5
        }
    }
};

