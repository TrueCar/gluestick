/* @flow */

import type { ConfigPlugin, Plugin, Logger } from '../types';

const path = require('path');

const getBaseConfig = require('./getBaseConfig');
const prepareEntries = require('./utils/prepareEntries');
const { requireModule } = require('../utils');
const applyConfigPlugins = require('./utils/applyConfigPlugins');
const readRuntimePlugins = require('../plugins/readRuntimePlugins');
const readServerPlugins = require('../plugins/readServerPlugins');
const gluestickConfig = require('../config/defaults/glueStickConfig');

const passThrough = config => config;

type OutputConfig = {
  client: Object,
  server: Object,
};

type Options = {
  skipClientEntryGeneration: boolean,
  skipServerEntryGeneration: boolean,
  entryOrGroupToBuild: string,
  noProgress: boolean,
};

module.exports = function getWebpackConfig(
  logger: Logger,
  plugins: ConfigPlugin[],
  {
    skipClientEntryGeneration,
    skipServerEntryGeneration,
    entryOrGroupToBuild,
    noProgress,
  }: Options = {},
): OutputConfig {
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

  // Get runtime and server plugins, both runtime and server plugins in this case
  // won't be included in client bundles but in server aka renderer bundle.
  // `./webpack/buildServerEntries.js` will invoke generator that will output
  // those plugins to `entires.js` (default) file.
  // This step is important, since server code will go through webpack
  // which requires static imports/requires, so all plugins must
  // be known in advance.
  const runtimeAndServerPlugins: Plugin[] = runtimePlugins.concat(
    skipClientEntryGeneration && skipServerEntryGeneration
      ? []
      : readServerPlugins(logger, gluestickConfig.pluginsConfigPath),
  );

  let webpackConfigHooks = {};

  try {
    webpackConfigHooks = requireModule(
      path.join(process.cwd(), gluestickConfig.webpackConfigPath),
    );
  } catch (e) {
    logger.fatal(e);
  }

  const config = getBaseConfig(
    {
      entries,
      noProgress,
      clientPlugins: runtimePlugins,
      serverPlugins: runtimeAndServerPlugins,
      skipClientEntryGeneration,
      skipServerEntryGeneration,
    },
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

  const serverConfig = applyConfigPlugins({
    type: 'server',
    phase: 'post',
    plugins,
    config: (webpackConfigHooks.server || passThrough)(
      applyConfigPlugins({
        type: 'server',
        phase: 'pre',
        config: config.server,
        plugins,
      }),
    ),
  });

  return {
    client: clientConfig.toObject(),
    server: serverConfig.toObject(),
  };
};
