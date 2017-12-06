const path = require('path');

const getBaseConfig = require('./getBaseConfig');
const prepareEntries = require('./utils/prepareEntries');
const { requireModule } = require('../utils');

const readRuntimePlugins = require('../plugins/readRuntimePlugins');

const passThrough = config => config;

function applyConfigPlugins({ type, phase, config, plugins }) {
  return plugins
    .filter(
      (plugin: ConfigPlugin): boolean =>
        (typeof plugin[type] === 'function' && phase === 'post') ||
        typeof plugin[type][phase] === 'function',
    )
    .reduce((modifiedConfig: Object, plugin: ConfigPlugin) => {
      return (plugin[type][phase] || plugin[type])(modifiedConfig);
    }, config);
}

module.exports = function getWebpackConfig(
  logger,
  plugins,
  gluestickConfig,
  {
    skipClientEntryGeneration,
    skipServerEntryGeneration,
    entryOrGroupToBuild,
    noProgress,
  } = {},
) {
  // Get entries to build from json file.
  // Those entries will be used to create clientEntryInit files, with initialization
  // code for client and serverEntries for server.
  let entries: Object = {};
  try {
    entries =
      skipClientEntryGeneration && skipServerEntryGeneration
        ? {}
        : prepareEntries(gluestickConfig, entryOrGroupToBuild);
  } catch (error) {
    logger.fatal(error);
  }

  // Get runtime plugins that will be applied to project code and bundled together.
  const runtimePlugins: Plugin[] =
    skipClientEntryGeneration && skipServerEntryGeneration
      ? []
      : readRuntimePlugins(logger, gluestickConfig.pluginsConfigPath);

  let webpackConfigHooks = {};

  try {
    webpackConfigHooks = requireModule(
      path.join(process.cwd(), gluestickConfig.webpackConfigPath),
    );
  } catch (e) {
    logger.fatal(e);
  }

  const config = getBaseConfig(
    { entries, noProgress },
    { gluestickConfig, logger },
  );

  const clientConfig = applyConfigPlugins({
    type: 'client',
    phase: 'post',
    plugins,
    config: (webpackConfigHooks.client || passThrough)(
      applyConfigPlugins({
        type: 'client',
        phase: 'pre',
        config: config.client,
        plugins,
      }),
    ),
  });

  return {
    client: clientConfig,
  };
};
