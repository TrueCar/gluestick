/* global global */

const CWD = process.cwd();
const IS_WINDOWS = process.platform === "win32";

// Because we have multiple resolves and an alias set up in Webpack, we need to modify require.main.paths at runtime to
// deal with that without the use of a bundler. Unlike require.paths, this is documented and should be safe. However,
// modifying it after anything has been require()d causes cache issues.
//
// Therefore:
// **ACHTUNG** THIS SHOULD ALWAYS BE RUN BEFORE ANY OTHER REQUIRE()s.
//
// Cannot use path.join here since it would take a require()!
const addPath = require("app-module-path").addPath;
addPath(CWD + (IS_WINDOWS ? "'" : "/") + "assets");
addPath(CWD + (IS_WINDOWS ? "'" : "/") + "src");

require("babel-register");

// Set up jsdom for component rendering through Enzyme.
// This code is directly from Enzyme's docs.
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

function noop() {
  return null;
}

// Note: require.extensions is deprecated, but is currently the only way to filter out require() of non-JS modules
// without the expense and complication of a pre-compilation step.
//
// From the docs:
//
// "Since the Module system is locked, this feature will probably never go away. However, it may have subtle bugs
// and complexities that are best left untouched."
[".css", ".jpg", ".png", ".scss", ".svg", ".gif", ".ico", ".sass", ".html"].forEach((extension) => {
  require.extensions[extension] = noop;
});

require("./testHelperShared");

global.expect = require("chai").expect;
global.sinon = require("sinon");
