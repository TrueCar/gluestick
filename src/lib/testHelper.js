/*global TEST_PATH*/
/*global SRC_PATH*/
require("babel-polyfill");
const React = require("react");
const ReactDOM = require("react-dom");
const ReactTestUtils = require("react-addons-test-utils");
global.React = React;
global.ReactDOM = ReactDOM;
global.TestUtils = ReactTestUtils;

const context = require.context(TEST_PATH, true, /\.test\.js$/);
context.keys().forEach(context);

const srcContext = require.context(SRC_PATH, true, /\.js$/);
srcContext.keys().forEach(srcContext);
