import fs from "fs";
import process from "process";
import path from "path";
import WebpackIsomorphicToolsPlugin from "webpack-isomorphic-tools/plugin";
import logger from "./cliLogger";

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
 * @param {RegExp} additions[n].test - test regex for webpack
 *
 * @return {Object}
 */
function prepareUserAdditionsForWebpack (additions) {
  return additions.map((addition) => {
    const test = addition.test && toString.call(addition.test) === "[object RegExp]" ?
      addition.test : WebpackIsomorphicToolsPlugin.regular_expression(addition.extensions);
    const webpackAddition = {
      loader: addition.loader,
      test: test
    };

    ["include", "exclude", "query"].forEach((optionalAddition) => {
      if (addition[optionalAddition]) {
        webpackAddition[optionalAddition] = addition[optionalAddition];
      }
    });
    return webpackAddition;
  });
}

/**
 * avoid having the client application having to include path in its dependencies by creating
 * the paths here rather than in webpack-additions.js
 */
function makeUserAdditionalAliases (aliasesDictionary={}) {
  return Object.entries(aliasesDictionary).reduce((map, [aliasName, aliasPath]) => {
    map[aliasName] = path.join(process.cwd(), ...aliasPath);
    return map;
  }, {});
}

export default function (isomorphic=false) {
  let userAdditions = {
    additionalAliases: {},
    additionalExternals: {},
    additionalLoaders: [],
    additionalPreLoaders: [],
    additionalWebpackNodeConfig: {},
    vendor: [],
    entryPoints: {},
    plugins: []
  };

  // Babel will try to resolve require statements ahead of time which will cause an error
  // when you run any commands outside of a GlueStick project since the webpack-additions file
  // has not been created yet. This way, we include the additions only if they exist.
  try {
    const webpackAdditionsPath = path.join(process.cwd(), "src", "config", "webpack-additions.js");
    fs.statSync(webpackAdditionsPath);
    const {
      additionalAliases,
      additionalExternals,
      additionalLoaders,
      additionalPreLoaders,
      additionalWebpackNodeConfig,
      vendor,
      plugins,
      entryPoints
    } = require(webpackAdditionsPath);
    userAdditions = {
      additionalAliases: makeUserAdditionalAliases(additionalAliases) || {},
      additionalExternals: additionalExternals || {},
      additionalLoaders: isomorphic ? additionalLoaders : prepareUserAdditionsForWebpack(additionalLoaders),
      additionalPreLoaders: isomorphic ? additionalPreLoaders : prepareUserAdditionsForWebpack(additionalPreLoaders),
      additionalWebpackNodeConfig: additionalWebpackNodeConfig || {},
      vendor: vendor || [],
      plugins: plugins || [],
      entryPoints: entryPoints || {}
    };
  }
  catch (e) {
    logger.warn("Error getting webpack additions:", e);
  }

  return userAdditions;
}
