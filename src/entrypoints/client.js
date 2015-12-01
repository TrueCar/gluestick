var createElement = require("react").createElement;
var render = require("react-dom").render;

var Main = require(__PATH_TO_MAIN__);

render(createElement(Main), document.getElementById("main"));

