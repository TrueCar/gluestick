(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("react"), require("react-router"), require("react-redux"), require("history/lib/createBrowserHistory"), require("radium"), require("redux"));
	else if(typeof define === 'function' && define.amd)
		define(["react", "react-router", "react-redux", "history/lib/createBrowserHistory", "radium", "redux"], factory);
	else if(typeof exports === 'object')
		exports["gluestick"] = factory(require(undefined), require("react-router"), require("react-redux"), require("history/lib/createBrowserHistory"), require(undefined), require("redux"));
	else
		root["gluestick"] = factory(root["React"], root["ReactRouter"], root["ReactRedux"], root["createBrowserHistory"], root["Radium"], root["redux"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_2__, __WEBPACK_EXTERNAL_MODULE_3__, __WEBPACK_EXTERNAL_MODULE_4__, __WEBPACK_EXTERNAL_MODULE_5__, __WEBPACK_EXTERNAL_MODULE_10__, __WEBPACK_EXTERNAL_MODULE_13__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
	
	var _sharedContainersRoot = __webpack_require__(1);
	
	var _sharedContainersRoot2 = _interopRequireDefault(_sharedContainersRoot);
	
	exports.Root = _sharedContainersRoot2["default"];
	
	var _sharedLibCreateStore = __webpack_require__(12);
	
	var _sharedLibCreateStore2 = _interopRequireDefault(_sharedLibCreateStore);
	
	exports.createStore = _sharedLibCreateStore2["default"];

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _reactRouter = __webpack_require__(3);
	
	var _reactRedux = __webpack_require__(4);
	
	var _historyLibCreateBrowserHistory = __webpack_require__(5);
	
	var _historyLibCreateBrowserHistory2 = _interopRequireDefault(_historyLibCreateBrowserHistory);
	
	var _libPrepareRoutesWithTransitionHooks = __webpack_require__(6);
	
	var _libPrepareRoutesWithTransitionHooks2 = _interopRequireDefault(_libPrepareRoutesWithTransitionHooks);
	
	var _componentsRadiumConfig = __webpack_require__(9);
	
	var _componentsRadiumConfig2 = _interopRequireDefault(_componentsRadiumConfig);
	
	// @TODO only do this if dev mode
	
	var _DevTools = __webpack_require__(11);
	
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

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_3__;

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_4__;

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_5__;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _reactRouter = __webpack_require__(3);
	
	var _sharedComponentsTransitionHooks = __webpack_require__(7);
	
	var _sharedComponentsTransitionHooks2 = _interopRequireDefault(_sharedComponentsTransitionHooks);
	
	exports["default"] = function (routes) {
	    return _react2["default"].createElement(
	        _reactRouter.Route,
	        { name: "TransitionHooks", component: _sharedComponentsTransitionHooks2["default"] },
	        routes
	    );
	};
	
	module.exports = exports["default"];

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _libRouteHelper = __webpack_require__(8);
	
	var TransitionHooks = (function (_Component) {
	    _inherits(TransitionHooks, _Component);
	
	    function TransitionHooks() {
	        _classCallCheck(this, TransitionHooks);
	
	        _get(Object.getPrototypeOf(TransitionHooks.prototype), "constructor", this).apply(this, arguments);
	    }
	
	    _createClass(TransitionHooks, [{
	        key: "componentWillMount",
	        value: function componentWillMount() {
	            var history = this.props.history;
	            var store = this.context.store;
	
	            this.unListenBefore = history.listenBefore((0, _libRouteHelper.createTransitionHook)(store, history));
	        }
	    }, {
	        key: "componentWillUnmount",
	        value: function componentWillUnmount() {
	            this.unListenBefore();
	        }
	    }, {
	        key: "render",
	        value: function render() {
	            return _react2["default"].createElement(
	                "div",
	                null,
	                this.props.children
	            );
	        }
	    }], [{
	        key: "contextTypes",
	        value: {
	            history: _react.PropTypes.object.isRequired,
	            store: _react.PropTypes.object.isRequired
	        },
	        enumerable: true
	    }]);
	
	    return TransitionHooks;
	})(_react.Component);
	
	exports["default"] = TransitionHooks;
	module.exports = exports["default"];

/***/ },
/* 8 */
/***/ function(module, exports) {

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

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _radium = __webpack_require__(10);
	
	var _radium2 = _interopRequireDefault(_radium);
	
	var RadiumConfig = (function (_Component) {
	    _inherits(RadiumConfig, _Component);
	
	    function RadiumConfig() {
	        _classCallCheck(this, _RadiumConfig);
	
	        _get(Object.getPrototypeOf(_RadiumConfig.prototype), "constructor", this).apply(this, arguments);
	    }
	
	    _createClass(RadiumConfig, [{
	        key: "render",
	        value: function render() {
	            return _react2["default"].createElement(
	                "div",
	                null,
	                this.props.children
	            );
	        }
	    }]);
	
	    var _RadiumConfig = RadiumConfig;
	    RadiumConfig = (0, _radium2["default"])(RadiumConfig) || RadiumConfig;
	    return RadiumConfig;
	})(_react.Component);
	
	exports["default"] = RadiumConfig;
	module.exports = exports["default"];

/***/ },
/* 10 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_10__;

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var _react = __webpack_require__(2);
	
	var _react2 = _interopRequireDefault(_react);
	
	//import { createDevTools } from "redux-devtools";
	//import LogMonitor from "redux-devtools-log-monitor";
	//import DockMonitor from "redux-devtools-dock-monitor";
	
	function createDevTools(children) {
	    var monitorElement = _react.Children.only(children);
	    var monitorProps = monitorElement.props;
	    var Monitor = monitorElement.type;
	    var ConnectedMonitor = connect(function (state) {
	        return state;
	    })(Monitor);
	    return (function (_Component) {
	        _inherits(DevTools, _Component);
	
	        function DevTools() {
	            _classCallCheck(this, DevTools);
	
	            _get(Object.getPrototypeOf(DevTools.prototype), "constructor", this).apply(this, arguments);
	        }
	
	        _createClass(DevTools, [{
	            key: "render",
	            value: function render() {
	                return _react2["default"].createElement(ConnectedMonitor, monitorProps);
	            }
	        }], [{
	            key: "instrument",
	            value: function value() {
	                return function (state, action) {
	                    console.log(state, action);
	                };
	            },
	            enumerable: true
	        }]);
	
	        return DevTools;
	    })(_react.Component);
	};
	
	exports["default"] = createDevTools(_react2["default"].createElement(
	    "div",
	    null,
	    "Dev tools test"
	));
	
	//export default createDevTools(
	//<DockMonitor defaultIsVisible={true} toggleVisibilityKey="H" changePositionKey="Q">
	//<LogMonitor theme="solarized" />
	//</DockMonitor>
	//);
	module.exports = exports["default"];

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
	
	var _redux = __webpack_require__(13);
	
	var _libPromiseMiddleware = __webpack_require__(14);
	
	var _libPromiseMiddleware2 = _interopRequireDefault(_libPromiseMiddleware);
	
	var _containersDevTools = __webpack_require__(11);
	
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
	    var finalCreateStore = (0, _redux.compose)((0, _redux.applyMiddleware)(_libPromiseMiddleware2["default"]))(
	    //DevTools.instrument() // @TODO: only include dev tools in development mode
	    _redux.createStore);
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

/***/ },
/* 13 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_13__;

/***/ },
/* 14 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }
	
	exports['default'] = function (_ref) {
	    var dispatch = _ref.dispatch;
	    var getState = _ref.getState;
	
	    return function (next) {
	        return function (action) {
	            var promise = action.promise;
	            var type = action.type;
	
	            var rest = _objectWithoutProperties(action, ['promise', 'type']);
	
	            if (!promise) return next(action);
	
	            var SUCCESS = type;
	            var INIT = type + '_INIT';
	            var FAILURE = type + '_FAILURE';
	
	            next(_extends({}, rest, { type: INIT }));
	
	            return promise.then(function (value) {
	                next(_extends({}, rest, { value: value, type: SUCCESS }));
	                return true;
	            })['catch'](function (error) {
	                next(_extends({}, rest, { error: error, type: FAILURE }));
	                return false;
	            });
	        };
	    };
	};
	
	module.exports = exports['default'];

/***/ }
/******/ ])
});
;
//# sourceMappingURL=index.js.map