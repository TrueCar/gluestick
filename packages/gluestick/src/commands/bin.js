/* @flow */
import type { CommandAPI, Logger } from '../types.js';

const spawn = require('cross-spawn');
const path = require('path');

// Creates patch to dependency's bin directory
const getDependencyPath = name =>
  path.join(process.cwd(), 'node_modules/.bin/', name);

// `opts` is array of options with Command object attached as last element
module.exports = (
  { getLogger, getOptions }: CommandAPI,
  commandArguments: any[],
) => {
  const logger: Logger = getLogger();

  logger.clear();
  logger.printCommandInfo();

  const dependencyName: string | any = commandArguments[0];
  const opts = getOptions(commandArguments);

  if (typeof dependencyName !== 'string') {
    logger.error('No binary is specified or is invalid');
    logger.error('Syntax for this command is `gluestick bin <binaryName>`');
    return;
  }
  spawn(getDependencyPath(dependencyName), opts.parent.rawArgs.slice(4), {
    stdio: 'inherit',
  }).on('error', error => {
    if (error.code === 'ENOENT') {
      logger.fatal(`No binary found for ${dependencyName}`);
    } else {
      logger.fatal(error);
    }
  });
};
