/* @flow */

import type { Logger } from '../types';

const fs = require('fs');
const path = require('path');

const isValidEntryPoint = (entryPoint: string, logger: Logger) => {
  if (!/^(shared|apps\/.+)$/.test(entryPoint)) {
    logger.error(entryPoint ? `${entryPoint} is not a valid entry point` : 'You did not specify an entry point');
    logger.info('Pass -E and a valid entry point: \'shared\' or \'apps/{validAppName}\'');
    return false;
  }
  const entryPath = path.join('src', entryPoint);
  if (!fs.existsSync(entryPath)) {
    logger.error(`Path ${entryPath} does not exist`);
    return false;
  }
  return true;
};

module.exports = {
  isValidEntryPoint,
};
