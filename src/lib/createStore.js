import thunk from "redux-thunk";
import { combineReducers, createStore, applyMiddleware, compose } from "redux";

import promiseMiddleware from "../lib/promiseMiddleware";
import DevTools from "../containers/DevTools";

/**
 * This reducer always returns the original state, this prevents an error when
 * no other reducers have been added.
 */
function _gluestick(state=true, action) {
  return state;
}

export default function (client, customRequire, customMiddleware, hotCallback, devMode) {
  const reducer = combineReducers(Object.assign({}, {_gluestick}, customRequire()));
  const middleware = [
      promiseMiddleware(client),
      thunk,
      ...customMiddleware
  ];

  // Include middleware that will warn when you mutate the state object
  // but only include it in dev mode
  if (devMode) {
    middleware.push(require("redux-immutable-state-invariant")());
  }

  const composeArgs = [
    applyMiddleware.apply(this, middleware)
  ];

  // Include dev tools only if we are in development mode
  if (devMode) {
    composeArgs.push(DevTools.instrument());
  }

  const finalCreateStore = compose.apply(null, composeArgs)(createStore);
  const store = finalCreateStore(reducer, typeof window !== "undefined" ? window.__INITIAL_STATE__ : {});

  if (hotCallback) {
    hotCallback(() => {
      const nextReducer = combineReducers(Object.assign({}, {_gluestick}, customRequire()));
      store.replaceReducer(nextReducer);
    });
  }

  return store;
}
