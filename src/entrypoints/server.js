const path = require("path");
const fs = require("fs");
require("../lib/projectRequireHack");
require("../lib/runThroughBabel");

// Developers can add an optional file in src/config/init.server.js that
// includes any script initialization stuff. This is a good place to add
// something like `require("newrelic");`
const optionalServerInitHookPath = path.join(process.cwd(), "src", "config", "init.server");
try {
  fs.statSync(optionalServerInitHookPath + ".js");
  require(optionalServerInitHookPath);
}
catch (e) {
  // NOOP
}

const WebpackIsomorphicTools = require("webpack-isomorphic-tools");

(function () {
  global.webpackIsomorphicTools = new WebpackIsomorphicTools(require("../config/webpack-isomorphic-tools-config"))
    .development(process.env.NODE_ENV !== "production")
    .server(process.cwd(), function () {
      require("../lib/server/index.js");
    });
})();
