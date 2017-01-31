const path = require('path');
const preparePlugins = require('../config/preparePlugins');
const compileGlueStickConfig = require('../config/compileGlueStickConfig');
const compileWebpackConfig = require('../config/compileWebpackConfig');
const logger = require('./logger');

const execHooks = (context, hooks) => {
  if (Array.isArray(hooks)) {
    hooks.forEach(fn => fn(context));
  } else if (typeof hooks === 'function') {
    hooks(context);
  }
};

module.exports = exports = (
  func,
  commandArguments,
  { useGSConfig, useWebpackConfig, skipProjectConfig } = {},
  { pre, post },
) => {
  const projectConfig = skipProjectConfig
    ? {}
    : require(path.join(process.cwd(), 'package.json')).gluestick;
  const plugins = preparePlugins(projectConfig);
  const GSConfig = useGSConfig ? compileGlueStickConfig(plugins, projectConfig) : null;
  const webpackConfig = useWebpackConfig ? compileWebpackConfig(plugins, projectConfig) : null;
  const context = {
    config: {
      projectConfig,
      GSConfig,
      webpackConfig,
      plugins,
    },
    logger,
  };
  execHooks(context, pre);
  execHooks(context, post);
  try {
    func(context, ...commandArguments);
  } catch (error) {
    process.stderr.write(error.message);
    process.exit(1);
  }
};
