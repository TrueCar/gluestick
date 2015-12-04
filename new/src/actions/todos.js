export const ADD_TODO = "ADD_TODO";
export const SET_TODOS = "SET_TODOS";

export function addTodo (text) {
    return {
        type: ADD_TODO,
        text: text
    };
}

export function getTodos (dispatch) {
    return new Promise((resolve) => {
        setTimeout(() => {
            dispatch(setTodos(["Item One", "Item Two"]));
            resolve();
        }, 1000);
    });
}

export function setTodos (todos) {
    return {
        type: SET_TODOS,
        todos
    };
}

