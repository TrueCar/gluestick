import { spawn } from 'cross-spawn';
import path from 'path';
import process from 'process';
import { which } from 'shelljs';
import autoUpgrade from '../autoUpgrade';

module.exports = async (name) => {
  await autoUpgrade();
  // Check if docker is installed first
  if (which('docker') !== null) {
    spawn(
      'docker',
      ['build', '-t', name, '-f', path.join(process.cwd(), 'src', 'config', '.Dockerfile'), process.cwd()],
      { stdio: 'inherit' },
    );
  } else {
    // TODO: Use logger from context
    // logger.warn('You must install docker before continuing');
  }
};
