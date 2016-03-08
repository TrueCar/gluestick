/* global global */
require("babel-polyfill");
var path = require("path");
var React = require("react");
var ReactDOM = require("react-dom");
var ReactTestUtils = require("react-addons-test-utils");
global.React = React;
global.ReactDOM = ReactDOM;
global.TestUtils = ReactTestUtils;

var context = require.context(TEST_PATH, true, /\.test\.js$/);
context.keys().forEach(context);

var srcContext = require.context(SRC_PATH, true, /\.js$/);
srcContext.keys().forEach(srcContext);
