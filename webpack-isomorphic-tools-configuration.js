var path = require("path");
var WebpackIsomorphicToolsPlugin = require("webpack-isomorphic-tools/plugin");

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
    }
  },
  alias: {
    "assets": path.join(process.cwd(), "assets")
  }
};

