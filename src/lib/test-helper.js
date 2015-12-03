/* global global */
import "babel-core/polyfill";
import path from "path";
import React from "react";
import ReactDOM from "react-dom";
import ReactTestUtils from "react-addons-test-utils";
global.React = React;
global.ReactDOM = ReactDOM;
global.TestUtils = ReactTestUtils;

var context = require.context(TEST_PATH, true, /\.test\.js$/);
context.keys().forEach(context);

