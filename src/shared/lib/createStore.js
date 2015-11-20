import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import createLogger from "redux-logger";

import * as reducers from "../reducers";
import apiPromiseMiddleware from "./apiPromiseMiddleware";


export default function(apiClient, data) {
    let finalCreateStore;

    if (__DEV__ && __CLIENT__ && __DEVTOOLS__) {
        const DevTools = require("../containers/DevTools");
        finalCreateStore = compose(
            applyMiddleware(
                apiPromiseMiddleware(apiClient),
                createLogger({
                    predicate: (_, action) => action.type !== "@@redux-devtools-log-monitor/UPDATE_SCROLL_TOP"
                })
            ),
            DevTools.instrument()
        )(createStore);
    } else {
        finalCreateStore = applyMiddleware(
            apiPromiseMiddleware(apiClient),
            createLogger({logger: console})
        )(createStore);
    }

    const reducer = combineReducers(require("../reducers/index"));
    const store = finalCreateStore(reducer, data);

    if (__DEV__ && module.hot) {
        module.hot.accept("../reducers/index", () => {
            const nextReducer = combineReducers(require("../reducers/index"));
            store.replaceReducer(nextReducer);
        });
    }

    return store;
}

