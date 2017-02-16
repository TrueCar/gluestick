/* @flow */

import type { Plugin } from '../types';

const path = require('path');

module.exports = ({ plugins }: { plugins: string[] } = {}): Plugin[] => {
  return Array.isArray(plugins) ? plugins.map(
    plugin => ({
      name: plugin,
      body: require(path.join(process.cwd(), 'node_modules', plugin))(),
    }),
  ) : [];
};
