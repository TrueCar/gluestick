import thunk from "redux-thunk";
import { combineReducers, createStore, applyMiddleware, compose } from "redux";
import _gluestick from "./reducers";
import promiseMiddleware from "../lib/promiseMiddleware";

const getMiddlewares = (middlewares, customMiddlewares) => {
  if (typeof customMiddlewares === 'function') {
    return customMiddlewares(middlewares);
  }

  return middlewares.concat(customMiddlewares);
};

export default function (client, customRequire, customMiddleware, hotCallback, devMode) {
  const reducer = combineReducers(Object.assign({}, {_gluestick}, customRequire()));

  let middleware = [
    promiseMiddleware(client),
    thunk,
  ];

  // Include middleware that will warn when you mutate the state object
  // but only include it in dev mode
  if (devMode) {
    middleware.push(require("redux-immutable-state-invariant")());
  }

  // When `customMiddleware` is of type `function`, pass it a shallow
  // copy of the current array of `middlewares` and expect a new value
  // in return. Fallback to default behaviour.
  if (typeof customMiddleware === 'function') {
    middleware = customMiddleware([...middleware]);
  } else {
    middleware.concat(customMiddleware);
  }

  const composeArgs = [
    applyMiddleware.apply(this, middleware),
    typeof window === "object" && typeof window.devToolsExtension !== "undefined" ? window.devToolsExtension() : f => f
  ];

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
