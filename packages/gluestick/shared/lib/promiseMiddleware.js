/* @flow */

import type { PromiseMiddleware } from '../types';

const promiseMiddleware: PromiseMiddleware = client => () => next => action => {
  const { promise, type, ...rest } = action;

  if (!promise) {
    return next(action);
  }

  const SUCCESS = type;
  const INIT = `${type}_INIT`;
  const FAILURE = `${type}_FAILURE`;

  next({ ...rest, type: INIT });

  const getPromise: Function =
    typeof promise === 'function' ? promise : () => promise;

  return getPromise(client).then(
    payload => {
      next({ ...rest, payload, type: SUCCESS });
      return payload || true;
    },
    error => {
      next({ ...rest, error, type: FAILURE });
      return false;
    },
  );
};

export default promiseMiddleware;
