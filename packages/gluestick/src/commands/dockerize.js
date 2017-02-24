/* @flow */
import type { Context } from '../types.js';

const spawn = require('cross-spawn');
const path = require('path');
const process = require('process');
const which = require('shelljs').which;

const autoUpgrade = require('../autoUpgrade/autoUpgrade');

module.exports = async ({ config, logger }: Context, name: string) => {
  await autoUpgrade({ config, logger });

  if (which('docker') !== null) {
    spawn(
      'docker',
      ['build', '-t', name, '-f', path.join(process.cwd(), 'src', 'config', '.Dockerfile'), process.cwd()],
      { stdio: 'inherit' },
    );
  } else {
    logger.warn('You must install docker before continuing');
  }
};
