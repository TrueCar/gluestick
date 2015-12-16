"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _chalk = require("chalk");

var _chalk2 = _interopRequireDefault(_chalk);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _react = require("react");

var _reactDomServer = require("react-dom/server");

var _routeHelper = require("./route-helper");

var _prettyError = require("pretty-error");

var _prettyError2 = _interopRequireDefault(_prettyError);

var _reactRouter = require("react-router");

var _prepareRoutesWithTransitionHooks = require("./prepareRoutesWithTransitionHooks");

var _prepareRoutesWithTransitionHooks2 = _interopRequireDefault(_prepareRoutesWithTransitionHooks);

var _sharedComponentsBody = require("../shared/components/Body");

var _sharedComponentsBody2 = _interopRequireDefault(_sharedComponentsBody);

var _sharedComponentsHead = require("../shared/components/head");

var _sharedComponentsHead2 = _interopRequireDefault(_sharedComponentsHead);

var pretty = new _prettyError2["default"]();

module.exports = function callee$0$0(req, res) {
    return regeneratorRuntime.async(function callee$0$0$(context$1$0) {
        var _this = this;

        while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
                try {
                    (function () {
                        var Index = require(_path2["default"].join(process.cwd(), "Index"));
                        var Entry = require(_path2["default"].join(process.cwd(), "src/config/.entry"));
                        var store = require(_path2["default"].join(process.cwd(), "src/config/.store"));
                        var originalRoutes = require(_path2["default"].join(process.cwd(), "src/config/routes"));
                        var routes = (0, _prepareRoutesWithTransitionHooks2["default"])(originalRoutes);
                        (0, _reactRouter.match)({ routes: routes, location: req.path }, function callee$2$0(error, redirectLocation, renderProps) {
                            var routingContext, radiumConfig, main, body;
                            return regeneratorRuntime.async(function callee$2$0$(context$3$0) {
                                while (1) switch (context$3$0.prev = context$3$0.next) {
                                    case 0:
                                        if (!error) {
                                            context$3$0.next = 4;
                                            break;
                                        }

                                        // @TODO custom 500 handling
                                        res.status(500).send(error.message);
                                        context$3$0.next = 19;
                                        break;

                                    case 4:
                                        if (!redirectLocation) {
                                            context$3$0.next = 8;
                                            break;
                                        }

                                        res.redirect(302, redirectLocation.pathname + redirectLocation.search);
                                        context$3$0.next = 19;
                                        break;

                                    case 8:
                                        if (!renderProps) {
                                            context$3$0.next = 18;
                                            break;
                                        }

                                        context$3$0.next = 11;
                                        return regeneratorRuntime.awrap((0, _routeHelper.fetchAllData)(store, renderProps || {}));

                                    case 11:
                                        routingContext = (0, _react.createElement)(_reactRouter.RoutingContext, renderProps);
                                        radiumConfig = { userAgent: req.headers["user-agent"] };
                                        main = (0, _react.createElement)(Entry, { store: store, routingContext: routingContext, radiumConfig: radiumConfig });
                                        body = (0, _react.createElement)(_sharedComponentsBody2["default"], { html: (0, _reactDomServer.renderToString)(main), initialState: store.getState() });

                                        // Grab the html from the project which is stored in the root
                                        // folder named Index.js. Pass the body and the head to that
                                        // component. `head` includes stuff that we want the server to
                                        // always add inside the <head> tag.
                                        //
                                        // Bundle it all up into a string, add the doctype and deliver
                                        res.status(200).send("<!DOCTYPE html>\n" + (0, _reactDomServer.renderToString)((0, _react.createElement)(Index, { body: body, head: _sharedComponentsHead2["default"] })));
                                        context$3$0.next = 19;
                                        break;

                                    case 18:
                                        // @TODO custom 404 handling
                                        res.status(404).send("Not Found");

                                    case 19:
                                    case "end":
                                        return context$3$0.stop();
                                }
                            }, null, _this);
                        });
                    })();
                } catch (error) {
                    console.error('SERVER ERROR:', pretty.render(error));
                    res.status(500).send({ error: error.stack });
                }

            case 1:
            case "end":
                return context$1$0.stop();
        }
    }, null, this);
};

// If we have a matching route, set up a routing context so
// that we render the proper page. On the client side, you
// embed the router itself, on the server you embed a routing
// context.
// [https://github.com/rackt/react-router/blob/master/docs/guides/advanced/ServerRendering.md]

// grab the main component which is capable of loading routes
// and hot loading them if in development mode

// grab the react generated body stuff. This includes the
// script tag that hooks up the client side react code.