import React, { Component, PropTypes } from "react";

export default class AddTodoForm extends Component {
    render () {
        return (
            <form onSubmit={this._addTodo}>
                <input ref={(n) => this.textNode = n} type="text" placholder="New Todo Text" />
            </form>
        );
    }

    _addTodo = (e) => {
        e.preventDefault();
        this.props.addTodo(this.textNode.value);
        this.textNode.value = "";
    }
}

