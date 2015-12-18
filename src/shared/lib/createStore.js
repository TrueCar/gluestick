import { combineReducers, createStore, applyMiddleware, compose } from "redux";
import promiseMiddleware from "../../lib/promiseMiddleware";
import DevTools from "../containers/DevTools";

/**
 * This reducer always returns the original state, this prevents an error when
 * no other reducers have been added.
 */
function _gluestick(state=true, action) {
    return state;
}

export default function (customRequire, hotCallback) {
    const reducer = combineReducers(Object.assign({}, {_gluestick}, customRequire()));
    const finalCreateStore = compose(
        applyMiddleware(promiseMiddleware),
        DevTools.instrument() // @TODO: only include dev tools in development mode
    )(createStore);
    const store = finalCreateStore(reducer, typeof window !== "undefined" ? window.__INITIAL_STATE__ : {});

    if (hotCallback) {
        hotCallback(() => {
            const nextReducer = combineReducers(Object.assign({}, {_gluestick}, customRequire()));
            store.replaceReducer(nextReducer);
        });
    }

    return store;
}

