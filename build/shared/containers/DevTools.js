"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _reduxDevtools = require("redux-devtools");

var _reduxDevtoolsLogMonitor = require("redux-devtools-log-monitor");

var _reduxDevtoolsLogMonitor2 = _interopRequireDefault(_reduxDevtoolsLogMonitor);

var _reduxDevtoolsDockMonitor = require("redux-devtools-dock-monitor");

var _reduxDevtoolsDockMonitor2 = _interopRequireDefault(_reduxDevtoolsDockMonitor);

exports["default"] = (0, _reduxDevtools.createDevTools)(_react2["default"].createElement(
    _reduxDevtoolsDockMonitor2["default"],
    { defaultIsVisible: true, toggleVisibilityKey: "H", changePositionKey: "Q" },
    _react2["default"].createElement(_reduxDevtoolsLogMonitor2["default"], { theme: "solarized" })
));
module.exports = exports["default"];