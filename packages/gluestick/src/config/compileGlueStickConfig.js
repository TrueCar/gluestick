/* @flow */
import type { ConfigPlugin, GSConfig, Logger } from '../types';

const clone = require('clone');
const path = require('path');
const defaultConfig = require('./defaults/glueStickConfig');
const hooksHelper = require('../renderer/helpers/hooks');
const { requireModule } = require('../utils');

type Options = {
  hideMissingConfigWarning: boolean;
};

const getConfigHook = (logger: Logger, { hideMissingConfigWarning }: Options = {}): Function => {
  try {
    const configHooks: Function = requireModule(
      path.join(process.cwd(), defaultConfig.gluestickConfigPath),
    );
    return config => hooksHelper.call(configHooks, config);
  } catch (e) {
    if (!hideMissingConfigWarning) {
      logger.warn('GlueStick config hook was not found. Consider running `gluestick auto-upgrade`.');
    }
    return config => config;
  }
};

module.exports = (
  logger: Logger, plugins: ConfigPlugin[], { hideMissingConfigWarning }: Options = {},
): GSConfig => {
  if (!Array.isArray(plugins)) {
    throw new Error('Invalid plugins argument');
  }

  return getConfigHook(logger, { hideMissingConfigWarning })(
    plugins
      .filter((plugin: ConfigPlugin): boolean => !!plugin.postOverwrites.gluestickConfig)
      // $FlowIgnore filter above ensures `gluestickConfig` won't be undefinfed/null
      .map((plugin: ConfigPlugin): Function => plugin.postOverwrites.gluestickConfig)
      .reduce((prev: GSConfig, curr: (config: GSConfig) => GSConfig): GSConfig => {
        return curr(clone(prev));
      }, defaultConfig),
  );
};
