var path = require("path");
var process = require("process");
var WebpackIsomorphicToolsPlugin = require("webpack-isomorphic-tools/plugin");

// We use `get-webpack-additions` to get the data back because it will first
// check if the file exists before trying to include it, falling back to empty
// arrays for defaults. Requiring get-webpack-additions will return a function
// instead of the result so we can execute the check asynchronously vs making
// it part of the initial build. If it were a simple require it would throw an
// error when babel or webpack try to resolve missing dependencies. We then
// call this method with `true` as the first and only argument because that is
// how we tell the method we are requiring for the purpose of the isomorphic
// tools, not the webpack config file.
const { additionalLoaders, additionalPreLoaders } = require("./src/lib/get-webpack-additions")(true);


let userExtensions = [];
[...additionalLoaders, ...additionalPreLoaders].forEach((loader) => {
  userExtensions.splice(userExtensions.length, 0, ...loader.extensions);
});

module.exports = {
  assets: {
    images: {
      extensions: ["png", "jpg", "gif", "ico", "svg"]
    },
    styles: {
      extensions: ["css", "scss", "sass"]
    },
    fonts: {
      extensions: ["woff", "woff2", "ttf", "eot"],
      parser: WebpackIsomorphicToolsPlugin.url_loader_parser
    },
    json: {
      extensions: ["json"],
      include: [process.cwd()]
    },
    other: {
      extensions: userExtensions
    }
  },
  alias: {
    "assets": path.join(process.cwd(), "assets")
  }
};
