"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.fetchAllData = fetchAllData;
exports.createTransitionHook = createTransitionHook;
var getFetchData = function getFetchData() {
    var _arguments = arguments;
    var _again = true;

    _function: while (_again) {
        _again = false;
        var component = _arguments.length <= 0 || _arguments[0] === undefined ? {} : _arguments[0];
        if (component.WrappedComponent) {
            _arguments = [component.WrappedComponent];
            _again = true;
            component = undefined;
            continue _function;
        } else {
            return component.fetchData;
        }
    }
};

function getRouteComponents(routes) {
    var components = [];

    routes.forEach(function (route) {
        if (route.components) Object.values(route.components).forEach(function (c) {
            return components.push(c);
        });else if (route.component) components.push(route.component);
    });

    return components;
}

function fetchAllData(store, renderProps) {
    var params = renderProps.params;
    var query = renderProps.location;

    var promises = getRouteComponents(renderProps.routes).map(getFetchData).filter(function (f) {
        return f;
    }) // only look at ones with a static fetchData()
    .map(function (fetchData) {
        return fetchData(store, params, query || {});
    }); // call fetch data methods and save promises

    return Promise.all(promises);
}

function createTransitionHook(store, history) {
    return function (location, cb) {
        history.match(location, function callee$2$0(error, redirectLocation, renderProps) {
            return regeneratorRuntime.async(function callee$2$0$(context$3$0) {
                while (1) switch (context$3$0.prev = context$3$0.next) {
                    case 0:
                        context$3$0.prev = 0;
                        context$3$0.next = 3;
                        return regeneratorRuntime.awrap(fetchAllData(store, renderProps));

                    case 3:
                        context$3$0.next = 8;
                        break;

                    case 5:
                        context$3$0.prev = 5;
                        context$3$0.t0 = context$3$0["catch"](0);

                        console.error(context$3$0.t0);

                    case 8:
                        context$3$0.prev = 8;

                        cb();
                        return context$3$0.finish(8);

                    case 11:
                    case "end":
                        return context$3$0.stop();
                }
            }, null, this, [[0, 5, 8, 11]]);
        });
    };
}