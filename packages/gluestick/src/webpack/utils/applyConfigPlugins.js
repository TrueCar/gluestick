/* @flow */

import type { WebpackConfig } from '../types';

import type { ConfigPlugin } from '../../types';

module.exports = function applyConfigPlugins({
  type,
  phase,
  config,
  plugins,
}: {
  type: string,
  phase: string,
  config: WebpackConfig,
  plugins: any[],
}): WebpackConfig {
  return plugins
    .filter(
      (plugin: ConfigPlugin): boolean =>
        (typeof plugin[type] === 'function' && phase === 'post') ||
        (plugin[type] && typeof plugin[type][phase] === 'function'),
    )
    .reduce((modifiedConfig: Object, plugin: ConfigPlugin) => {
      return (plugin[type][phase] || plugin[type])(modifiedConfig);
    }, config);
};
