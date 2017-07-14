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
const hookHelper = require('../renderer/helpers/hooks');
const { requireModule } = require('../utils');
const {
  extract_package_name,
} = require('universal-webpack/build/server configuration');

type CompilationOptions = {
  skipClientEntryGeneration: boolean,
  skipServerEntryGeneration: boolean,
  entryOrGroupToBuild?: string,
};

module.exports = (
  logger: Logger,
  plugins: ConfigPlugin[],
  gluestickConfig: GSConfig,
  {
    skipClientEntryGeneration,
    skipServerEntryGeneration,
    entryOrGroupToBuild,
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
    { skipEntryGeneration: skipClientEntryGeneration },
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
    { skipEntryGeneration: skipServerEntryGeneration },
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
  const clientEnvConfigFinal: WebpackConfig = hookHelper.call(
    webpackConfigHooks.webpackClientConfig,
    clientEnvConfigOverwriten,
  );

  // Applies server hooks provided by user
  const serverEnvConfigFinal: WebpackConfig = hookHelper.call(
    webpackConfigHooks.webpackServerConfig,
    serverEnvConfigOverwriten,
  );

  // We need to replace request handler added by universal-webpack
  // because the original one doesn't take aliases added in plugins/hooks into the account.
  if (serverEnvConfigFinal.externals) {
    const handlerIndex: number = serverEnvConfigFinal.externals.findIndex(
      external => typeof external === 'function',
    );
    const originalHandler: Function =
      // $FlowIgnore flow is $hit, and doesn't know that `externals` was check for not being undefied
      serverEnvConfigFinal.externals[handlerIndex];
    // $FlowIgnore flow is $hit, and doesn't know that `externals` was check for not being undefied
    serverEnvConfigFinal.externals.splice(handlerIndex, 1);
    // $FlowIgnore flow is $hit, and doesn't know that `externals` was check for not being undefied
    serverEnvConfigFinal.externals.push((ctx, req, cb) => {
      const packageName = extract_package_name(req);
      return Object.keys(
        typeof serverEnvConfigFinal.resolve === 'object' &&
        !Array.isArray(serverEnvConfigFinal.resolve)
          ? serverEnvConfigFinal.resolve.alias
          : {},
      ).filter(alias => alias === packageName).length
        ? cb()
        : originalHandler(ctx, req, cb);
    });
  }

  // logger.info(clientEnvConfigFinal);

  return {
    universalSettings: universalWebpackSettings,
    client: clientEnvConfigFinal,
    server: serverEnvConfigFinal,
  };
};
