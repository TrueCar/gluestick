require("./projectRequireHack");
require("babel-polyfill");
const React = require("react");
const ReactDOM = require("react-dom");
global.React = React;
global.ReactDOM = ReactDOM;

