/* @flow */
import type { CLIContext } from '../../types';

const autoUpgrade = require('./autoUpgrade');

module.exports = async (context: CLIContext) => {
  await autoUpgrade(context);
};
