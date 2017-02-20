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

type ExecWithConfig = (
  func: Function,
  commandArguments: Array<*>,
  options: {
    useGSConfig: boolean,
    useWebpackConfig: boolean,
    skipProjectConfig: boolean,
    skipClientEntryGeneration: boolean,
    skipServerEntryGeneration: boolean,
  },
  hooks: {
    pre: Function,
    post: Function,
  }
) => void;

module.exports = (
  func,
  commandArguments,
  {
    useGSConfig,
    useWebpackConfig,
    skipProjectConfig,
    skipClientEntryGeneration,
    skipServerEntryGeneration,
  } = {},
  { pre, post } = {},
): ExecWithConfig => {
  const projectConfig = skipProjectConfig
    ? {}
    : require(path.join(process.cwd(), 'package.json')).gluestick;
  const plugins = preparePlugins(projectConfig);
  const GSConfig = useGSConfig ? compileGlueStickConfig(plugins, projectConfig) : null;
  const webpackConfig = useWebpackConfig ? compileWebpackConfig(
    logger, plugins, projectConfig, GSConfig,
    { skipClientEntryGeneration, skipServerEntryGeneration },
  ) : null;
  const context = {
    config: {
      projectConfig,
      GSConfig,
      webpackConfig,
      plugins,
    },
    logger,
  };
  try {
    execHooks(context, pre);
    func(context, ...commandArguments);
    execHooks(context, post);
  } catch (error) {
    process.stderr.write(error.message);
    process.exit(1);
  }
};
