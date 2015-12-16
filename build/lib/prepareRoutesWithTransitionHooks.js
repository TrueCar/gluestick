"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _reactRouter = require("react-router");

var _sharedComponentsTransitionHooks = require("../shared/components/TransitionHooks");

var _sharedComponentsTransitionHooks2 = _interopRequireDefault(_sharedComponentsTransitionHooks);

exports["default"] = function (routes) {
    return _react2["default"].createElement(
        _reactRouter.Route,
        { name: "TransitionHooks", component: _sharedComponentsTransitionHooks2["default"] },
        routes
    );
};

module.exports = exports["default"];