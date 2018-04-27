/* @flow */

import type {
  ConfigPlugin,
  Plugin,
  GSConfig,
  WebpackConfig,
  UniversalWebpackConfigurator,
  Logger,
  UniversalSettings,
  CompiledConfig,
  WebpackHooks,
} from '../types';

const path = require('path');
const clone = require('clone');
const getSharedConfig = require('./webpack/webpack.config');
const getClientConfig = require('./webpack/webpack.config.client');
const getServerConfig = require('./webpack/webpack.config.server');
const prepareEntries = require('./webpack/prepareEntries');
const readRuntimePlugins = require('../plugins/readRuntimePlugins');
const readServerPlugins = require('../plugins/readServerPlugins');
const callHook = require('../renderer/helpers/callHook');
const { requireModule } = require('../utils');

type CompilationOptions = {
  skipClientEntryGeneration: boolean,
  skipServerEntryGeneration: boolean,
  entryOrGroupToBuild?: string,
  noProgress: boolean,
};

module.exports = (
  logger: Logger,
  plugins: ConfigPlugin[],
  gluestickConfig: GSConfig,
  {
    skipClientEntryGeneration,
    skipServerEntryGeneration,
    entryOrGroupToBuild,
    noProgress,
  }: CompilationOptions = {},
): CompiledConfig => {
  const env: string = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';

  // Those settings define entrypoint of server bundle and output bundle
  // which will be used by webpack.
  const universalWebpackSettings: UniversalSettings = {
    server: {
      input: path.join(__dirname, '../renderer/entry.js'),
      output: path.join(
        process.cwd(),
        gluestickConfig.buildRendererPath,
        'renderer.js',
      ),
    },
    silent: true,
  };

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

  // Get shared config between client and server.
  const sharedConfig: WebpackConfig = getSharedConfig(gluestickConfig);

  // Apply pre overwriters from config plugins to shared webpack config.
  const sharedConfigFinal: WebpackConfig = plugins
    .filter(
      (plugin: ConfigPlugin): boolean =>
        !!plugin.preOverwrites.sharedWebpackConfig,
    )
    .reduce((prev: Object, plugin: ConfigPlugin) => {
      return plugin.preOverwrites.sharedWebpackConfig
        ? // $FlowIgnore
          plugin.preOverwrites.sharedWebpackConfig(clone(prev))
        : prev;
    }, sharedConfig);

  // Get client non-env specific webpack config.
  const clientConfig: UniversalWebpackConfigurator = getClientConfig(
    logger,
    sharedConfigFinal,
    universalWebpackSettings,
    gluestickConfig,
    entries,
    runtimePlugins,
    { skipEntryGeneration: skipClientEntryGeneration, noProgress },
  );
  // Get client env specific webpack config.
  const clientEnvConfig: WebpackConfig = require(`./webpack/webpack.config.client.${env}`)(
    clientConfig,
    gluestickConfig.ports.client,
    gluestickConfig.host,
  );
  // Get runtime and server plugins, both runtime and server plugins in this case
  // won't be included in client bundles but in server aka renderer bundle.
  // `./webpack/buildServerEntries.js` will invoke generator that will output
  // those plugins to `entires.js` (default) file.
  // This step is important, since server code will go throught webpack
  // which requires static imports/requires, so all plugins must
  // be known in advance.
  const runtimeAndServerPlugins: Plugin[] = runtimePlugins.concat(
    skipClientEntryGeneration && skipServerEntryGeneration
      ? []
      : readServerPlugins(logger, gluestickConfig.pluginsConfigPath),
  );

  // Get server non-env specific webpack config.
  const serverConfig: WebpackConfig = getServerConfig(
    logger,
    sharedConfigFinal,
    universalWebpackSettings,
    gluestickConfig,
    entries,
    runtimeAndServerPlugins,
    { skipEntryGeneration: skipServerEntryGeneration, noProgress },
  );
  // Get server env specific webpack config.
  const serverEnvConfig: WebpackConfig = require(`./webpack/webpack.config.server.${env}`)(
    serverConfig,
    gluestickConfig.ports.client,
  );

  // Apply post overwriters from config plugins to final client webpack config.
  const clientEnvConfigOverwriten: WebpackConfig = plugins
    .filter(
      (plugin: ConfigPlugin): boolean =>
        !!plugin.postOverwrites.clientWebpackConfig,
    )
    .reduce((prev: Object, plugin: ConfigPlugin) => {
      return plugin.postOverwrites.clientWebpackConfig
        ? // $FlowIgnore
          plugin.postOverwrites.clientWebpackConfig(clone(prev))
        : prev;
    }, clientEnvConfig);

  // Apply post overwriters from config plugins to final server webpack config.
  const serverEnvConfigOverwriten: WebpackConfig = plugins
    .filter(
      (plugin: ConfigPlugin): boolean =>
        !!plugin.postOverwrites.serverWebpackConfig,
    )
    .reduce((prev: Object, plugin: ConfigPlugin) => {
      return plugin.postOverwrites.serverWebpackConfig
        ? // $FlowIgnore
          plugin.postOverwrites.serverWebpackConfig(clone(prev))
        : prev;
    }, serverEnvConfig);

  const pathToWebpackConfigHooks: string = path.join(
    process.cwd(),
    gluestickConfig.webpackHooksPath,
  );

  let webpackConfigHooks: WebpackHooks = {};

  try {
    webpackConfigHooks = requireModule(pathToWebpackConfigHooks);
  } catch (e) {
    logger.warn(e);
  }

  // Applies client hooks provided by user
  const clientEnvConfigFinal: WebpackConfig = callHook(
    webpackConfigHooks.webpackClientConfig,
    clientEnvConfigOverwriten,
  );

  // Applies server hooks provided by user
  const serverEnvConfigFinal: WebpackConfig = callHook(
    webpackConfigHooks.webpackServerConfig,
    serverEnvConfigOverwriten,
  );

  return {
    // this is used in one place, refactor it out
    universalSettings: universalWebpackSettings,
    client: clientEnvConfigFinal,
    server: serverEnvConfigFinal,
  };
};
