export default ({dispatch, getState}) => {
    return next => action => {
        const { promise, type, ...rest } = action;

        if (!promise) return next(action);

        const SUCCESS = type;
        const INIT = type + '_INIT';
        const FAILURE = type + '_FAILURE';

        next({...rest, type: INIT});

        return promise
            .then(value => {
                next({...rest, value, type: SUCCESS});
                return true;
            })
            .catch(error => {
                next({...rest, error, type: FAILURE});
                return false;
            });
    };
}

