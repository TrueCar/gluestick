/* @flow */
import type { Context } from '../../types';

const autoUpgrade = require('./autoUpgrade');

module.exports = async (context: Context) => {
  await autoUpgrade(context);
};
