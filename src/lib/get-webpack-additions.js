import fs from "fs";
import process from "process";
import path from "path";
import WebpackIsomorphicToolsPlugin from "webpack-isomorphic-tools/plugin";

/**
 * GlueStick uses webpack-isomorphic-tools to support server side rendering.
 * The syntax for this is slightly different than the webpack config file.
 * Instead of defining a `test` regex, you supply an array of extensions.
 * For more information see: https://github.com/halt-hammerzeit/webpack-isomorphic-tools.
 *
 * In order for the webpack-isomorphic-tools format to work with our webpack config, we
 * need to convert the `extensions` array to a regex.
 *
 * @param {Array<Object>} additions array of loaders or preloaders formatted for webpack-isomorphic-tools
 * @param {Array<String>} additions[n].extensions array of strings representing file extensions
 * @param {String} additions[n].loader name of the loader to use
 *
 * @return {Object}
 */
function prepareUserAdditionsForWebpack (additions) {
  return additions.map((addition) => {
    return {
      loader: addition.loader,
      test: WebpackIsomorphicToolsPlugin.regular_expression(addition.extensions)
    }
  });
}

export default function () {
  let userAdditions = {
    additionalLoaders: [],
    additionalPreLoaders: []
  };

  // Babel will try to resolve require statements ahead of time which will cause an error
  // when you run any commands outside of a GlueStick project since the webpack-additions file
  // has not been created yet. This way, we include the additions only if they exist.
  try {
    const webpackAdditionsPath = path.join(process.cwd(), "src", "config", "webpack-additions.js");
    fs.statSync(webpackAdditionsPath);
    const { additionalLoaders, additionalPreLoaders } = require(webpackAdditionsPath);
    userAdditions = {
      additionalLoaders: prepareUserAdditionsForWebpack(additionalLoaders),
      additionalPreLoaders: prepareUserAdditionsForWebpack(additionalPreLoaders)
    };
  }
  catch (e) {}

  return userAdditions;
}
