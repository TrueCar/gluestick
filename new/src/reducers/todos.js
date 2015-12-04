import { ADD_TODO, SET_TODOS } from "../actions/todos";

const INITIAL_STATE = [];

export default (state=INITIAL_STATE, action) => {
    switch (action.type) {
        case ADD_TODO:
            return [...state, action.text];
            break;
        case SET_TODOS:
            return action.todos;
            break;
        default:
            return state;
    }
};

