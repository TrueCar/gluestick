var fs = require("fs");
var path = require("path");

var babelrc = fs.readFileSync("./.babelrc");
var config;

try {
    config = JSON.parse(babelrc);
} catch (error) {
    console.log("Error parsing .babelrc");
}

require("babel-core/register")(config);

module.exports = function () {
    console.log(config);
};

