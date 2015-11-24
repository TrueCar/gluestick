import { combineReducers, createStore } from "redux";

let store;

export default (reducers) => {
    store = store || createStore(combineReducers(reducers));

    const nextRootReducer = combineReducers(reducers);
    store.replaceReducer(nextRootReducer);

    return store;
};

