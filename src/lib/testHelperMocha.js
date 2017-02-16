/* global global */
require("./runThroughBabel");

const path = require("path");
const requireHacker = require("require-hacker");
const configTools = require("../config/webpack-isomorphic-tools-config");
const alias = configTools.alias;
const images = configTools.assets.images.extensions;
const other = configTools.assets.other.extensions;
const styles = configTools.assets.styles.extensions;

// Hook up webpack alias and ignore file extensions that only work with webpack
requireHacker.resolver((input, module) => {
  const parts = input.split("/");
  const pathName = parts[0];
  const aliasMatch = alias[pathName];
  if (aliasMatch) {
    return requireHacker.resolve(path.join(aliasMatch, parts.slice(1).join("/")), module);
  }

  const mock = RegExp(`^[./a-zA-Z0-9@$_-]+\\.(${images.join("|")}|${other.join("|")}|${styles.join("|")})$`);
  if (mock.test(input)) {
    return requireHacker.resolve(path.join(__dirname, "fileMock.js"));
  }

  return;
});

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
