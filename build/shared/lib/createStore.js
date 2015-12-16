"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _redux = require("redux");

var _libPromiseMiddleware = require("../../lib/promiseMiddleware");

var _libPromiseMiddleware2 = _interopRequireDefault(_libPromiseMiddleware);

var _containersDevTools = require("../containers/DevTools");

var _containersDevTools2 = _interopRequireDefault(_containersDevTools);

/**
 * This reducer always returns the original state, this prevents an error when
 * no other reducers have been added.
 */
function _gluestick(state, action) {
    if (state === undefined) state = true;

    return state;
}

exports["default"] = function (customRequire, hotCallback) {
    var reducer = (0, _redux.combineReducers)(Object.assign({}, { _gluestick: _gluestick }, customRequire()));
    var finalCreateStore = (0, _redux.compose)((0, _redux.applyMiddleware)(_libPromiseMiddleware2["default"]), _containersDevTools2["default"].instrument() // @TODO: only include dev tools in development mode
    )(_redux.createStore);
    var store = finalCreateStore(reducer, typeof window !== "undefined" ? window.__INITIAL_STATE__ : {});

    if (hotCallback) {
        hotCallback(function () {
            var nextReducer = (0, _redux.combineReducers)(Object.assign({}, { _gluestick: _gluestick }, customRequire()));
            store.replaceReducer(nextReducer);
        });
    }

    return store;
};

module.exports = exports["default"];