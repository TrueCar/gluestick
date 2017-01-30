const path = require("path");
const preparePlugins = require("./config/preparePlugins");
const compileGlueStickConfig = require("./config/compileGlueStickConfig");
const compileWebpackConfig = require("./config/compileWebpackConfig");

module.exports = exports = (
  func,
  commandArguments,
  { useGSConfig, useWebpackConfig, skipProjectConfig } = {},
  preExec
) => {
  const projectConfig = skipProjectConfig
    ? {}
    : require(path.join(process.cwd(), "package.json")).gluestick;
  const plugins = preparePlugins(projectConfig);
  const GSConfig = useGSConfig ? compileGlueStickConfig(plugins) : null;
  const webpackConfig = useWebpackConfig ? compileWebpackConfig(plugins) : null;
  const config = {
    projectConfig,
    plugins,
    GSConfig,
    webpackConfig
  };
  const logger = {}; // temp
  if (Array.isArray(preExec)) {
    preExec.forEach(fn => fn(config, logger));
  } else if (typeof preExec === "function") {
    preExec(config, logger);
  }
  func(config, logger, commandArguments);
};
