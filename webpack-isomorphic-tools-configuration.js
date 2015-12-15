var path = require("path");
var WebpackIsomorphicToolsPlugin = require("webpack-isomorphic-tools/plugin");

module.exports = {
    assets: {
        images: {
            extensions: ["png", "jpg", "gif", "ico", "svg"]
        }
    },
    alias: {
        "assets": path.join(process.cwd(), "assets")
    }
};

