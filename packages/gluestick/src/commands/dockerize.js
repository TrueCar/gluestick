/* @flow */
import type { CommandAPI, Logger } from '../types.js';

const spawn = require('cross-spawn');
const path = require('path');
const process = require('process');
const which = require('shelljs').which;

module.exports = ({ getLogger }: CommandAPI, commandArguments: any[]) => {
  const logger: Logger = getLogger();

  logger.clear();
  logger.printCommandInfo();

  const name: string = commandArguments[0];

  if (which('docker') !== null) {
    spawn(
      'docker',
      [
        'build',
        '-t',
        name,
        '-f',
        path.join(process.cwd(), 'src', 'config', '.Dockerfile'),
        process.cwd(),
      ],
      { stdio: 'inherit' },
    );
  } else {
    logger.error('You must install docker before continuing');
  }
};
