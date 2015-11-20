export default function apiPromiseMiddleware(client) {
    return ({dispatch, getState}) => {
        return next => action => {
            //if (typeof action === 'function') {
            //    return action(dispatch, getState);
            //}

            const { apiPromise, type, ...rest } = action;

            if (!apiPromise) return next(action);

            const SUCCESS = type;
            const REQUEST = type + '_REQUEST';
            const FAILURE = type + '_FAILURE';

            next({...rest, type: REQUEST});

            return apiPromise(client)
                .then(res => {
                    next({...rest, res, type: SUCCESS});
                    return true;
                })
                .catch(error => {
                    next({...rest, error, type: FAILURE});
                    return false;
                });
        };
    };
}
