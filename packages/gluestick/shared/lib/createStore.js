/* @flow */

import thunk from 'redux-thunk';
import { combineReducers, createStore, applyMiddleware, compose } from 'redux';
import _gluestick from './reducers';
import promiseMiddleware from '../lib/promiseMiddleware';

type Store = Object;
type CreateStore = () => Store;

export default function(
  client: () => Object,
  customRequire: () => Object,
  customMiddleware: (middlewares: any[]) => any[] | any[],
  hotCallback: (cb: Function) => void,
  devMode: Boolean,
  thunkMiddleware: Function,
): Store {
  const reducer: Object = combineReducers(
    Object.assign({}, { _gluestick }, customRequire()),
  );

  let middleware: Function[] = [
    promiseMiddleware(client),
    // Using OR operator instead of default argument, since null value will be casted to false
    thunkMiddleware || thunk,
  ];

  // Include middleware that will warn when you mutate the state object
  // but only include it in dev mode
  if (devMode) {
    middleware.push(require('redux-immutable-state-invariant')());
  }

  // When `customMiddleware` is of type `function`, pass it current
  // array of `middlewares` and expect a new value in return.
  // Fallback to default behaviour.
  middleware =
    typeof customMiddleware === 'function'
      ? customMiddleware([...middleware])
      : middleware.concat(customMiddleware);

  const composeArgs: Function[] = [
    applyMiddleware.apply(this, middleware),
    typeof window === 'object' &&
    typeof window.devToolsExtension !== 'undefined' &&
    process.env.NODE_ENV !== 'production'
      ? window.devToolsExtension()
      : f => f,
  ];

  const finalCreateStore: CreateStore = compose(...composeArgs)(createStore);
  const store: Store = finalCreateStore(
    reducer,
    typeof window !== 'undefined' ? window.__INITIAL_STATE__ : {},
  );

  if (hotCallback) {
    hotCallback((): void => {
      const nextReducer: Object = combineReducers(
        Object.assign({}, { _gluestick }, customRequire()),
      );
      store.replaceReducer(nextReducer);
    });
  }

  return store;
}
