/* @flow */
import type { ConfigPlugin, GSConfig, Logger } from '../types';
import { callHook } from '../renderer/helpers/hooks';

const clone = require('clone');
const path = require('path');
const defaultConfig = require('./defaults/glueStickConfig');
const { requireModule } = require('../utils');

const getConfigHook = (logger: Logger): Function => {
  try {
    const configHooks: Function = requireModule(
      path.join(process.cwd(), defaultConfig.gluestickConfigPath),
    );
    return config => callHook(configHooks, config);
  } catch (e) {
    logger.warn(
      'GlueStick config hook was not found. Consider running `gluestick auto-upgrade`.',
    );
    return config => config;
  }
};

module.exports = (logger: Logger, plugins: ConfigPlugin[]): GSConfig => {
  if (!Array.isArray(plugins)) {
    throw new Error('Invalid plugins argument');
  }

  return getConfigHook(logger)(
    plugins
      .filter(
        (plugin: ConfigPlugin): boolean =>
          !!plugin.postOverwrites.gluestickConfig,
      )
      .map(
        (plugin: ConfigPlugin): Function =>
          // $FlowIgnore filter above ensures `gluestickConfig` won't be undefinfed/null
          plugin.postOverwrites.gluestickConfig,
      )
      .reduce(
        (prev: GSConfig, curr: (config: GSConfig) => GSConfig): GSConfig => {
          return curr(clone(prev));
        },
        defaultConfig,
      ),
  );
};
