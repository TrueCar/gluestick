var path = require("path");
var process = require("process");
var WebpackIsomorphicToolsPlugin = require("webpack-isomorphic-tools/plugin");
const { additionalLoaders, additionalPreLoaders } = require(path.join(process.cwd(), "src/config/webpack-additions.js"));

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
