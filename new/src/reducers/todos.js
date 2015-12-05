import { ADD_TODO, GET_TODOS } from "../actions/todos";

const INITIAL_STATE = [];

export default (state=INITIAL_STATE, action) => {
    switch (action.type) {
        case ADD_TODO:
            return [...state, action.text];
            break;
        case GET_TODOS:
            return action.value;
            break;
        default:
            return state;
    }
};

