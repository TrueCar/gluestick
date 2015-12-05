import { combineReducers, createStore, applyMiddleware, compose } from "redux";
import promiseMiddleware from "../../lib/promiseMiddleware";

export default function (customRequire, hotCallback) {
    const reducer = combineReducers(customRequire());
    const finalCreateStore = compose(
        applyMiddleware(promiseMiddleware)
    )(createStore);
    const store = finalCreateStore(reducer, typeof window !== "undefined" ? window.__INITIAL_STATE__ : {});

    if (hotCallback) {
        hotCallback(() => {
            const nextReducer = combineReducers(customRequire());
            store.replaceReducer(nextReducer);
        });
    }

    return store;
}

