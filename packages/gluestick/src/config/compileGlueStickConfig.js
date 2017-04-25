/* @flow */
import type { ConfigPlugin, GSConfig, Logger } from '../types';

const clone = require('clone');
const path = require('path');
const defaultConfig = require('./defaults/glueStickConfig');
const hooksHelper = require('../renderer/helpers/hooks');

const getConfigHook = (logger: Logger): Function => {
  try {
    const configHooks: Function = require(
      path.join(process.cwd(), defaultConfig.gluestickConfigPath),
    ).default;
    return config => hooksHelper.call(configHooks, config);
  } catch (e) {
    logger.warn('GlueStick config hook was not found. Consider running `gluestick auto-upgrade`.');
    return config => config;
  }
};

module.exports = (logger: Logger, plugins: ConfigPlugin[]): GSConfig => {
  if (!Array.isArray(plugins)) {
    throw new Error('Invalid plugins argument');
  }

  return getConfigHook(logger)(
    plugins
      .filter((plugin: ConfigPlugin): boolean => !!plugin.postOverwrites.gluestickConfig)
      // $FlowIgnore filter above ensures `gluestickConfig` won't be undefinfed/null
      .map((plugin: ConfigPlugin): Function => plugin.postOverwrites.gluestickConfig)
      .reduce((prev: GSConfig, curr: (config: GSConfig) => GSConfig): GSConfig => {
        return curr(clone(prev));
      }, defaultConfig),
  );
};
