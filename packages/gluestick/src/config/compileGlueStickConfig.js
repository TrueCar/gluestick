/* @flow */
import type { ConfigPlugin, GSConfig, Logger } from '../types';

const clone = require('clone');
const path = require('path');
const defaultConfig = require('./defaults/glueStickConfig');
const hooksHelper = require('../renderer/helpers/hooks');
const { requireModule } = require('../utils');

const getConfigHook = (logger: Logger): Function => {
  try {
    const configHooks: Function = requireModule(
      path.join(process.cwd(), defaultConfig.gluestickConfigPath),
    );
    return config => hooksHelper.call(configHooks, config);
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

  const config = getConfigHook(logger)(
    plugins
      .map(plugin => plugin.gluestick)
      .filter(Boolean)
      .reduce(
        (prev: GSConfig, curr: (config: GSConfig) => GSConfig): GSConfig => {
          return curr(clone(prev));
        },
        defaultConfig,
      ),
  );

  // Overwrite config so it doesn't have to passed down as param.
  Object.keys(config).forEach(key => {
    defaultConfig[key] = config[key];
  });

  return config;
};
