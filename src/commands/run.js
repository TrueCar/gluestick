import "babel-register";
import path from "path";
import WebpackIsomorphicTools from "webpack-isomorphic-tools";
import webpackIsomorphicToolsConfig from "../config/webpack-isomorphic-tools-config";

module.exports = function (scriptPath, cb) {
  try {
    new WebpackIsomorphicTools(webpackIsomorphicToolsConfig)
      .development(process.env.NODE_ENV !== "production")
      .server(process.cwd(), () => {
        try {
          require(path.join(process.cwd(), scriptPath));
          cb();
        }
        catch (e) {
          cb(e);
        }
      });
  }
  catch (e) {
    cb(e);
  }
};

