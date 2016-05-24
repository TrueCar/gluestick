require("../lib/runThroughBabel");
const WebpackIsomorphicTools = require("webpack-isomorphic-tools");

(function () {
  global.webpackIsomorphicTools = new WebpackIsomorphicTools(require("../config/webpack-isomorphic-tools-config"))
    .development(process.env.NODE_ENV !== "production")
    .server(process.cwd(), function () {
      require("../lib/server/index.js");
    });
})();
