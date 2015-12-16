"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _reactRouter = require("react-router");

var _reactRedux = require("react-redux");

var _historyLibCreateBrowserHistory = require("history/lib/createBrowserHistory");

var _historyLibCreateBrowserHistory2 = _interopRequireDefault(_historyLibCreateBrowserHistory);

var _libPrepareRoutesWithTransitionHooks = require("../../lib/prepareRoutesWithTransitionHooks");

var _libPrepareRoutesWithTransitionHooks2 = _interopRequireDefault(_libPrepareRoutesWithTransitionHooks);

var _componentsRadiumConfig = require("../components/RadiumConfig");

var _componentsRadiumConfig2 = _interopRequireDefault(_componentsRadiumConfig);

// @TODO only do this if dev mode

var _DevTools = require("./DevTools");

var _DevTools2 = _interopRequireDefault(_DevTools);

var Root = (function (_Component) {
    _inherits(Root, _Component);

    _createClass(Root, null, [{
        key: "propTypes",
        value: {
            routes: _react.PropTypes.object,
            reducers: _react.PropTypes.object,
            routerHistory: _react.PropTypes.any,
            routingContext: _react.PropTypes.object
        },
        enumerable: true
    }, {
        key: "defaultProps",
        value: {
            routerHistory: typeof window !== "undefined" ? (0, _historyLibCreateBrowserHistory2["default"])() : null
        },
        enumerable: true
    }]);

    function Root(props) {
        _classCallCheck(this, Root);

        _get(Object.getPrototypeOf(Root.prototype), "constructor", this).call(this, props);
        this.state = {
            mounted: false
        };
    }

    _createClass(Root, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            this.setState({ mounted: true });
        }
    }, {
        key: "render",
        value: function render() {
            var _props = this.props;
            var routes = _props.routes;
            var routerHistory = _props.routerHistory;
            var routingContext = _props.routingContext;
            var radiumConfig = _props.radiumConfig;
            var store = _props.store;

            var router = this._renderRouter();
            var devTools = this._renderDevTools();

            return _react2["default"].createElement(
                _componentsRadiumConfig2["default"],
                { radiumConfig: radiumConfig },
                _react2["default"].createElement(
                    _reactRedux.Provider,
                    { store: store },
                    _react2["default"].createElement(
                        "div",
                        null,
                        router,
                        devTools
                    )
                )
            );
        }
    }, {
        key: "_renderRouter",
        value: function _renderRouter() {
            var _props2 = this.props;
            var routes = _props2.routes;
            var routingContext = _props2.routingContext;
            var routerHistory = _props2.routerHistory;

            // server rendering
            if (routingContext) return routingContext;

            return _react2["default"].createElement(
                _reactRouter.Router,
                { history: routerHistory },
                (0, _libPrepareRoutesWithTransitionHooks2["default"])(routes)
            );
        }
    }, {
        key: "_renderDevTools",
        value: function _renderDevTools() {
            if (!this.state.mounted) return;
            return _react2["default"].createElement(_DevTools2["default"], null);
        }
    }]);

    return Root;
})(_react.Component);

exports["default"] = Root;
module.exports = exports["default"];