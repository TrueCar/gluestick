var createElement = require("react").createElement;
var render = require("react-dom").render;

var Entry = require(__PATH_TO_ENTRY__);

render(createElement(Entry, {radiumConfig: {userAgent: window.navigator.userAgent}}), document.getElementById("main"));

