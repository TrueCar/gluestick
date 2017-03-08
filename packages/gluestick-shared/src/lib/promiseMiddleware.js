export default function promiseMiddleware(client) {
  // eslint-disable-next-line no-unused-vars
  return ({ dispatch, getState }) => {
    return next => action => {
      const { promise, type, ...rest } = action;

      if (!promise) {
        return next(action);
      }

      const SUCCESS = type;
      const INIT = `${type}_INIT`;
      const FAILURE = `${type}_FAILURE`;

      next({ ...rest, type: INIT });

      let getPromise;
      if (typeof promise === 'function') {
        getPromise = promise;
      } else {
        getPromise = () => {
          return promise;
        };
      }

      return getPromise(client)
        .then(
          value => {
            next({ ...rest, value, type: SUCCESS });
            return value || true;
          },
          error => {
            next({ ...rest, error, type: FAILURE });
            return false;
          },
        );
    };
  };
}

