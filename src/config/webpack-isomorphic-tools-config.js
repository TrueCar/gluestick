import logger from "../lib/cliLogger";
import { highlight } from "../lib/cliColorScheme";

const path = require("path");
const process = require("process");
const WebpackIsomorphicToolsPlugin = require("webpack-isomorphic-tools/plugin");

// We use `getWebpackAdditions` to get the data back because it will first
// check if the file exists before trying to include it, falling back to empty
// arrays for defaults. Requiring getWebpackAdditions will return a function
// instead of the result so we can execute the check asynchronously vs making
// it part of the initial build. If it were a simple require it would throw an
// error when babel or webpack try to resolve missing dependencies. We then
// call this method with `true` as the first and only argument because that is
// how we tell the method we are requiring for the purpose of the isomorphic
// tools, not the webpack config file.
const { additionalLoaders, additionalPreLoaders, additionalAliases } = require("../lib/getWebpackAdditions").default(true);

const userExtensions = [];
[...additionalLoaders, ...additionalPreLoaders].forEach((loader) => {
  // Bail out when a test regexp has been supplied.
  if (loader.test && toString.call(loader.test) === "[object RegExp]") { return; }

  // If someone wants to include a custom .js loader, we do not want the isomorphic tools to treat it as an asset
  // because .js imports are a native part of how node works. We do want webpack to receive the loader though.
  if (loader.extensions.includes("js")) { return; }

  if (!loader.extensions || loader.extensions.length === 0) {
    logger.info(`An additional loader is missing the ${highlight("extensions")} property and is being ignored!`);
    return;
  }

  userExtensions.splice(userExtensions.length, 0, ...loader.extensions);
});

module.exports = {
  assets: {
    images: {
      extensions: ["png", "jpg", "gif", "ico", "svg"],
      regular_expression: /\.(png|jpg|gif|ico|svg)(\?v=\d+\.\d+\.\d+)?$/
    },
    styles: {
      extensions: ["css", "scss", "sass"],
      filter: function(module, regex, options, log) {
        return WebpackIsomorphicToolsPlugin.style_loader_filter(module, regex, options, log);
      },
      path: WebpackIsomorphicToolsPlugin.style_loader_path_extractor,
      parser: WebpackIsomorphicToolsPlugin.css_loader_parser
    },
    fonts: {
      extensions: ["woff", "woff2", "ttf", "eot"],
      regular_expression: /\.(woff|woff2|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
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
    "assets": path.join(process.cwd(), "assets"),
    "actions": path.join(process.cwd(), "src", "actions"),
    "components": path.join(process.cwd(), "src", "components"),
    "containers": path.join(process.cwd(), "src", "containers"),
    "reducers": path.join(process.cwd(), "src", "reducers"),
    ...additionalAliases
  },
  patch_require: true
};
