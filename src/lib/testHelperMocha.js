/* global global */
require('babel-register');

function noop() {
  return null;
}

const jsdom = require("jsdom").jsdom;

global.document = jsdom("");
global.window = document.defaultView;
Object.keys(document.defaultView).forEach((property) => {
  if (typeof global[property] === "undefined") {
    global[property] = document.defaultView[property];
  }
});

global.navigator = {
  userAgent: "node.js"
};

require.extensions[".scss"] = noop;
require.extensions[".png"] = noop;
require.extensions[".svg"] = noop;

require('./testHelperShared');

global.expect = require("chai").expect;
global.sinon = require("sinon");
