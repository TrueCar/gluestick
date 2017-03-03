/* @flow */
import type { ConfigPlugin } from '../types';

const path = require('path');
const prepareConfigPlugins = require('../plugins/prepareConfigPlugins');
const compileGlueStickConfig = require('../config/compileGlueStickConfig');
const compileWebpackConfig = require('../config/compileWebpackConfig');
const loggerFactory = require('./logger');

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
    useGSConfig: boolean;
    useWebpackConfig: boolean;
    skipProjectConfig: boolean;
    skipClientEntryGeneration: boolean;
    skipServerEntryGeneration: boolean;
    skipPlugins: boolean;
  },
  hooks: {
    pre: Function;
    post: Function;
  }
) => void;

const execWithConfig: ExecWithConfig = (
  func,
  commandArguments,
  {
    useGSConfig,
    useWebpackConfig,
    skipProjectConfig,
    skipClientEntryGeneration,
    skipServerEntryGeneration,
    skipPlugins,
  } = {},
  { pre, post } = {},
): void => {
  const logger = loggerFactory(commandArguments[commandArguments.length - 1].logLevel);
  let packageJson = {};
  try {
    packageJson = require(path.join(process.cwd(), 'package.json'));
    if (!packageJson.dependencies.gluestick) {
      throw new Error('Command need to be run in gluestick project.');
    }
  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }
  const projectConfig: Object = skipProjectConfig
    ? {}
    : packageJson.gluestick;
  const pluginsConfigPath: string = path.join(process.cwd(), 'src/gluestick.plugins.js');
  const plugins: ConfigPlugin[] = !skipPlugins
    ? prepareConfigPlugins(logger, pluginsConfigPath)
    : [];
  const GSConfig = useGSConfig ? compileGlueStickConfig(plugins, projectConfig) : null;
  if (GSConfig) {
    GSConfig.pluginsConfigPath = pluginsConfigPath;
  }
  const webpackConfig = GSConfig && useWebpackConfig ? compileWebpackConfig(
    logger, plugins, projectConfig, GSConfig,
    {
      skipClientEntryGeneration,
      skipServerEntryGeneration,
      entryOrGroupToBuild: commandArguments[commandArguments.length - 1].entrypoints,
    },
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

module.exports = execWithConfig;
