import { combineReducers, createStore } from "redux";

export default function (customRequire, hotCallback) {
    const reducer = combineReducers(customRequire());
    const store = createStore(reducer);

    if (hotCallback) {
        hotCallback(() => {
            const nextReducer = combineReducers(customRequire());
            store.replaceReducer(nextReducer);
        });
    }

    return store;
}

