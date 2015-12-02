import { ADD_TODO } from "../actions/todos";

const INITIAL_STATE = ["First Item", "Second Item"];

export default (state=INITIAL_STATE, action) => {
    switch (action.type) {
        case ADD_TODO:
            return [...state, action.text];
            break;
        default:
            return state;
    }
};

